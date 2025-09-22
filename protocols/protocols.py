import json, requests, time, os

from ic.principal import Principal

from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4
from uagents_core.contrib.protocols.chat import (
    chat_protocol_spec,
    ChatMessage,
    ChatAcknowledgement,
    TextContent,
    StartSessionContent,
)

from uagents import Context, Protocol

# Protocols
from protocols.transfer import set_confirmation_msg
from protocols.tools.project import (
    Project, 
    project_tool, 
    get_project_brief, 
    mapping_project_request, 
    mapping_timelines_request,
    separate_recipient_amount,
)

from protocols.tools.task import (
    TaskList,
    task_tool, 
    mapping_tasks_request, 
)

# Utils
from utils.canister import make_canister
from utils.coin import icp_to_e8s, e8s_to_icp
from utils.identity import generate_ed25519_identity
from utils.candid import unwrap_candid, can_result
from utils.context import get_private_key_for_sender, get_principal_for_sender, get_account_id_for_sender

# Config
from config.prompt import transfer_result
from config.messages import help_message, error_message
from config.tools import tools, Tool
from config.config import DFX_NETWORK, ASI1_BASE_URL, ASI1_HEADERS

# MARK: User step

class StepType(str, Enum):
    TRANSFER_ICP = "transfer_icp"
    PROJECT_DETAIL = "project_detail"
    PROJECT_PAYOUT = "project_payout"
    PROJECT_PLANNER = "project_planner"

def _get_pending_step(step_name: StepType, ctx: Context) -> dict | None:
    try:
        step_data = ctx.storage.get(step_name) or {}
        return step_data.get(getattr(ctx, "sender", None))
    except Exception:
        return None

def _set_pending_step(step_name: StepType, ctx: Context, payload: dict) -> None:
    step_data = ctx.storage.get(step_name) or {}
    step_data[getattr(ctx, "sender", None)] = payload
    ctx.storage.set(step_name, step_data)

def _clear_pending_step(step_name: StepType, ctx: Context) -> None:
    step_data = ctx.storage.get(step_name) or {}
    sender_key = getattr(ctx, "sender", None)
    if sender_key in step_data:
        del step_data[sender_key]
        ctx.storage.set(step_name, step_data)

# MARK: AS1 Call

def _asi1_call(ctx: Context, payload: dict[str, any]) -> str:
    try:
        response = requests.post(
            f"{ASI1_BASE_URL}/chat/completions",
            headers=ASI1_HEADERS,
            json=payload,
        )

        response.raise_for_status()
        res_json = response.json()

        ctx.logger.info(f"ASI1 Response: {res_json}")

        return res_json["choices"][0]["message"]
    except Exception as e:
        return json.dumps(e)

# MARK: Tool handler

async def tool_handler(ctx: Context, func_name: str, args: dict):
    # Create canister
    private_key = get_private_key_for_sender(ctx)
    ctx.logger.info(f"Private key: {private_key}")

    can_ledger = make_canister("icp_ledger", private_key)
    can_user = make_canister("user", private_key)
    can_ai = make_canister("ai", private_key)
    can_project = make_canister("project", private_key)
    can_task = make_canister("task", private_key)
    can_project_escrow = make_canister("project_escrow", private_key)

    try:
        result = ""

        match func_name:
            # MARK: Get icp address
            case Tool.GET_ICP_ADDRESS.value:
                principal = get_principal_for_sender(ctx)
                result = {
                    "address": principal,
                    "accountId": get_account_id_for_sender(ctx),
                }

                if DFX_NETWORK != "local":
                    result.update({
                        "network": "ic",
                        "explorer": f"https://dashboard.internetcomputer.org/principal/{principal}",
                    })
            
            # MARK: Get icp Balance
            case Tool.GET_ICP_BALANCE.value:
                MAX_RETRIES = 5
                for attempt in range(MAX_RETRIES):
                    try:
                        balance = unwrap_candid(can_ledger.icrc1_balance_of({"owner": get_principal_for_sender(ctx), "subaccount": []}))
                        result = { "balance": e8s_to_icp(balance) }
                        break
                    except Exception as e:
                        ctx.logger.info(f"Attempt {attempt+1} failed: {e}")

                        if "timed out" in str(e).lower() or "deadline" in str(e).lower():
                            if attempt < MAX_RETRIES - 1:
                                sleep_time = 2 * (2 ** attempt)  # exponential backoff
                                print(f"Retrying in {sleep_time} seconds...")
                                time.sleep(sleep_time)
                            else:
                                raise # throw err when last attempt
                        else:
                            raise

            # MARK: Transfer icp
            case Tool.TRANSFER_ICP.value:
                # Parse payload to list
                transactions = separate_recipient_amount(args["recipientAmount"])

                # Sum amount
                totalAmount = sum(item["amount"] for item in transactions)

                # Check user balance
                principal = get_principal_for_sender(ctx)
                balance = can_result(can_ledger.icrc1_balance_of({ "owner": principal, "subaccount": [] }))
                ledgerFee = can_result(can_ledger.icrc1_fee())
                shouldBeBalance = totalAmount + (ledgerFee * len(transactions))

                if balance < shouldBeBalance:
                    return f"Tell sender balance is Insufficient. Required: {shouldBeBalance}. Available: {balance}. Then tell to add more balance first"
                
                results = []
                for tx in transactions:
                    recipient = tx["recipient"]
                    amount = icp_to_e8s(tx["amount"])

                    ctx.logger.info(f"Transfer to: {recipient}, amount: {amount}")

                    # Transfer coin
                    transfer = can_ledger.icrc1_transfer({
                        "to": {"owner": recipient, "subaccount": []},
                        "amount": amount,
                        "fee": [], # from ledger fee
                        "memo": [],
                        "from_subaccount": [],
                        "created_at_time": []
                    })

                    # Handle response Ok/Err
                    res_raw = {
                        "recipient": recipient,
                        "amount": amount
                    }

                    if isinstance(transfer, dict):
                        transfer_lower = {k.lower(): v for k, v in transfer.items()}

                        if "ok" in transfer_lower:
                            res_raw.update({
                                "status": "success",
                                "ok": transfer_lower["ok"]
                            })
                        elif "err" in transfer_lower:
                            res_raw.update({
                                "status": "failed",
                                "err": transfer_lower["err"]
                            })
                    else:
                        res_raw.update({
                            "status": "unknown",
                            "raw": transfer
                        })
                
                    # Append
                    results.append(res_raw)
            
            # MARK: Task analyzer
            case Tool.TASK_ANALYZER.value:
                return {
                    "task_title": args["taskTitle"],
                    "task_description": args["taskDesc"],
                    "user_asking": args["userQuestion"],
                    "wants": (
                        "From the provided task title and description, give a clear and concise explanation "
                        "of what the task entails and what needs to be done. "
                        "Additionally, provide practical tips or suggestions on how to approach and complete the task efficiently, "
                        "highlighting any potential pitfalls or best practices that could help in execution. "
                        "Limit the tips to a maximum of 5 actionable points."
                    )
                }

            # MARK: Project detail
            case Tool.GET_PROJECT_DETAIL.value:
                MAX_RETRIES = 5
                for attempt in range(MAX_RETRIES):
                    try:
                        # Get user team key
                        ref_key = can_result(can_user.getTeamRefCode())
                        ctx.logger.info("Asdasd")
                        
                        # Get data project
                        project = can_result(can_project.getProjectByKeyword(ref_key, args["keyword"]))
                        ctx.logger.info("Asdasd")
                        # Get task review
                        task = can_result(can_task.projectAnalysis(project["id"]))
                        ctx.logger.info("Asdasd")

                        ctx.logger.info(next(iter(project["projectType"])))
                        
                        project_status = next(iter(project["status"]))
                        project_type = next(iter(project["projectType"]))
                        project_reward = e8s_to_icp(project['reward']);
                        result = {
                            "project": {
                                "name": project["name"],
                                "desc": project["desc"],
                                "status": project_status,
                                "projectType": project_type,
                                "reward": f"{project_reward} ICP",
                            },
                        }

                        # MARK: Complete
                        # Project is complete
                        if "done" in project_status:
                            ctx.logger.info("Project status completed")
                            result.update({
                                "wants": (
                                    "Provide a complete summary of the project data, "
                                    "then clearly inform the user that this project has been marked as finished."
                                )
                            })

                        # MARK: Remaining task
                        # Project tasks are still remaining
                        elif task:
                            ctx.logger.info(f"Remaining task are found: {task}")
                            result.update({
                                "senderId": get_principal_for_sender(ctx),
                                "task_remaining": task,
                                "wants": (
                                    "Summarize the overall project data first. "
                                    "Since there are still remaining tasks, explain how many are pending and indicate how urgent they are. "
                                    "Do not list or break down the individual tasks yet. "
                                    "Finally, ask the user if they would like a detailed breakdown of these tasks along with tips and guidance to help complete them [yes/no]."
                                )
                            })
                            
                            _set_pending_step(StepType.PROJECT_DETAIL.value, ctx, {
                                "func_name": func_name, 
                                "args": args,
                                "task": task,
                                "next_call_func": Tool.BREAKDOWN_TASK.value,
                            })

                        # MARK: Not payout
                        # Project tasks are complete but not payout yet
                        elif "done" not in project_status:
                            if "rewarded" in project_type:
                                ctx.logger.info("Project not payout yet")
                                result.update({
                                    "project_reward": f"{project_reward} ICP",
                                    "wants": (
                                        "Provide a full summary of the project data. "
                                        "Since this project has a reward, suggest to the sender that you can help recommend a fair distribution "
                                        "of the reward based on the team’s performance (focusing on members who completed their tasks). "
                                        "This recommendation will serve as a reference for the payout process. [yes/no]"
                                    )
                                })

                                _set_pending_step(StepType.PROJECT_DETAIL.value, ctx, {
                                    "func_name": func_name, 
                                    "args": args,
                                    "project_id": project["id"],
                                    "project_name": project["name"],
                                    "project_reward": project["reward"],
                                    "next_call_func": Tool.TASK_OVERVIEW.value, # Get task overview first
                                })
                            else:
                                ctx.logger.info("Project is free")
                                result.update({
                                    "project_reward": f"{project_reward} ICP",
                                    "wants": (
                                        "Provide a full summary of the project data. "
                                        "Explain that there is no reward assigned to this project. "
                                        "Offer assistance by asking if you should help mark the project as completed."
                                    )
                                })

                        # MARK: No task project
                        else:
                            ctx.logger.info("Project didnt has task")
                            result.update({
                                "wants": (
                                    "Provide a complete summary of the project data"
                                )
                            })
                    except Exception as e:
                        ctx.logger.info(f"Attempt {attempt+1} failed: {e}")

                        if "timed out" in str(e).lower() or "timeout" in str(e).lower()  or "deadline" in str(e).lower():
                            if attempt < MAX_RETRIES - 1:
                                sleep_time = 2 * (2 ** attempt)  # exponential backoff
                                print(f"Retrying in {sleep_time} seconds...")
                                time.sleep(sleep_time)
                            else:
                                raise # throw err when last attempt
                        else:
                            raise

            # MARK: Task breakdown
            case Tool.BREAKDOWN_TASK.value:
                pending = _get_pending_step(StepType.PROJECT_DETAIL.value, ctx)
                if not pending:
                    raise Exception("pending step project detail not found")

                return {
                    "task_remaining": pending.get("task"),
                    "wants": (
                        "For each pending task, provide only the task title first. "
                        "After listing them, give a single-paragraph tip on how to complete the tasks efficiently. "
                        "Format should be:\n\n"
                        "1. Task Title\n"
                        "Tips: <your tip here>\n"
                    )
                }

            # MARK: Task overview
            case Tool.TASK_OVERVIEW.value:
                pending = _get_pending_step(StepType.PROJECT_DETAIL.value, ctx)
                if not pending:
                    raise Exception("pending step project detail not found")
                
                
                project_id = pending.get("project_id")
                project_name = pending.get("project_name")

                # Get task overview
                overview = can_result(can_task.getUserOverview(project_id))
                reward_float = e8s_to_icp(pending.get("project_reward", 0))
                if reward_float == 0:
                    return {
                        "wants": (
                            "Check if the project reward is empty (0 ICP). "
                            "If so, explain to the user that the reward cannot be mapped to the participants. "
                            "Then, politely ask the user if they would like assistance in marking the project as completed instead."
                        )
                    }

                escrowFee = can_result(can_project_escrow.getEscrowFee())
                overview_list = []
                for item in overview:
                    overview_list.append({
                        "userId": Principal.to_str(item["userId"]),
                        "totalOverdue": item["totalOverdue"],
                        "totalDone": item["totalDone"],
                        "totalTask": item["totalTask"]
                    })


                result = {
                    "overview": overview_list,
                    "project_reward": f"{reward_float} ICP",
                    "project_name": project_name,
                    "wants": (
                        "Provide a simple overview of the project task completion: "
                        "Then, distribute the total project reward proportionally according to their performance. "
                        "Ensure the total payout matches the project reward exactly, and do not exceed the total."
                        "Last, list the reward they will receive along with a summary of tasks completed and overdue, "
                        "in the following format:\n\n"
                        "userID\n -> reward: X ICP, completed: Y, overdue: Z (if any, otherwise dont show)\n"
                        "...\n\n"
                        "Just give simple overview with reward distribution on format, dont add some information else"
                    )
                }

            # MARK: Payout team
            case Tool.PAYOUT_TEAM.value:
                ref_key = can_result(can_user.getTeamRefCode())
                project = can_result(can_project.getProjectByKeyword(ref_key, args["keyword"]))

                escrow_canister = os.getenv(f"CANISTER_ID_PROJECT_ESCROW")
                sender = get_principal_for_sender(ctx)
                
                transactions = separate_recipient_amount(args["recipientAmount"])
                totalAmount = sum(item["amount"] for item in transactions)

                MAX_RETRIES = 5
                RETRY_STEP = "balance"
                for attempt in range(MAX_RETRIES):
                    try:
                        if "balance" in RETRY_STEP: 
                            # Check user balance
                            balance = can_result(can_ledger.icrc1_balance_of({ "owner": sender, "subaccount": [] }))
                            escrowFee = can_result(can_project_escrow.getEscrowFee())
                            totalReward = totalAmount + escrowFee

                            ctx.logger.info(f"User balance: {balance}")
                            ctx.logger.info(f"Total Reward: {totalReward}")

                            if balance < totalReward:
                                return f"Tell sender balance is Insufficient. Required: {totalReward}. Available: {balance}. Then tell to add more balance first"
                            
                            MAX_RETRIES = 5
                            RETRY_STEP = "allowed"

                        
                        if "allowed" in RETRY_STEP: 
                            # Check allowance
                            allowance = can_result(can_ledger.icrc2_allowance({
                                "account": {
                                    "owner": sender, 
                                    "subaccount": []
                                },
                                "spender": {
                                    "owner": escrow_canister, 
                                    "subaccount": []
                                },
                            }))

                            totalAllow = allowance["allowance"]
                            if totalAllow == 0 or totalAllow < totalAmount:
                                return f"User has not approved enough allowance. Current allowance: {totalAllow}, required: {totalAmount}"
                            
                            MAX_RETRIES = 5
                            RETRY_STEP = "payout"

                        if "payout" in RETRY_STEP: 
                            # Make payout
                            payout = can_result(can_project_escrow.executeTeamPayout(
                                project["id"],
                                transactions,
                                sender,
                            ))
                            
                            MAX_RETRIES = 5
                            RETRY_STEP = "update"

                        if "update" in RETRY_STEP: 
                            # Make project as done
                            can_result(can_project.updateProjectStatus(project["id"], { "done": None }))
                
                            result = {
                                "total_transfer": payout["totalAmount"],
                                "total_recipient": payout["totalRecipients"],
                                "success_transfer": payout["successfulTransfers"],
                                "failed_transfer": payout["failedTransfers"],
                                "wants": "Summarize the payout results clearly. Highlight if there are any failed transfers and mention the overall outcome."
                            }

                
                    except Exception as e:
                        ctx.logger.info(f"Attempt {attempt+1} failed: {e}")

                        if "timed out" in str(e).lower() or "deadline" in str(e).lower():
                            if attempt < MAX_RETRIES - 1:
                                sleep_time = 2 * (2 ** attempt)  # exponential backoff
                                print(f"Retrying in {sleep_time} seconds...")
                                time.sleep(sleep_time)
                            else:
                                raise # throw err when last attempt
                        else:
                            raise

            # MARK: Generate project
            case Tool.GENERATE_PROJECT.value:
                res_message = _asi1_call(ctx, {
                    "model": "asi1-experimental",
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are an assistant that extracts and structures project information. "
                                "Always return the project using the provided function. "
                                "Ensure tasks are realistic, between 4 and 10, and due_date is epoch rounded to day."
                            )
                        },
                        {"role": "user", "content": get_project_brief(args)}
                    ],
                    "tools": [project_tool()],
                })

                if res_message["content"]:
                    return res_message["content"]

                # Ambil hasil dari tool_calls
                project_raw = res_message["tool_calls"][0]["function"]["arguments"]

                # Parse dari string ke dict
                project: Project = json.loads(project_raw)

                ctx.logger.info("Mapping data request")

                caller = get_principal_for_sender(ctx)
                users = can_result(can_user.getUserList({
                    "roles": [],
                    "tags": [],
                    "keyword": [],
                }))
                ctx.logger.info("Found users")

                reqProject = mapping_project_request(project)
                reqTimelines = mapping_timelines_request(project["timelines"])
                reqTasks = mapping_tasks_request(project["tasks"], users)

                ctx.logger.info("Saving project")

                MAX_RETRIES = 5
                for attempt in range(MAX_RETRIES):
                    try:
                        response = unwrap_candid(can_ai.projectPlanner(
                            caller, 
                            reqProject,
                            reqTimelines,
                            reqTasks,
                        ))

                        result = response["message"]
                        break
                    except Exception as e:
                        ctx.logger.info(f"Attempt {attempt+1} failed: {e}")

                        if "timed out" in str(e).lower() or "deadline" in str(e).lower():
                            if attempt < MAX_RETRIES - 1:
                                sleep_time = 2 * (2 ** attempt)  # exponential backoff
                                print(f"Retrying in {sleep_time} seconds...")
                                time.sleep(sleep_time)
                            else:
                                raise # throw err when last attempt
                        else:
                            raise

            # MARK: Generate tasks
            case Tool.GENERATE_PROJECT_TASK.value:
                res_message = _asi1_call(ctx, {
                    "model": "asi1-experimental",
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are an AI that decomposes project briefs into actionable subtasks. "
                                "Each subtask must include: title, description, tag (ui, frontend, backend, or business_analyst), "
                                "and a due date in epoch seconds. "
                                "All due dates must be valid future dates (after this week) and staggered logically: "
                                "planning/design first, then development, then testing/review. "
                                "Cover both technical and non-technical aspects."
                            )
                        },
                        {"role": "user", "content": args["brief"]}
                    ],
                    "tools": [task_tool()],
                })

                if res_message["content"]:
                    return res_message["content"]

                # Ambil hasil dari tool_calls
                task_raw = res_message["tool_calls"][0]["function"]["arguments"]

                task: TaskList = json.loads(task_raw)

                ctx.logger.info("Mapping data request")

                caller = get_principal_for_sender(ctx)
                ref_key = can_result(can_user.getTeamRefCode())
                ctx.logger.info(f"Ref key: {ref_key}")
                project = can_result(can_project.getProjectByKeyword(ref_key, args["keyword"]))
                ctx.logger.info("Found project reward")
                users = can_result(can_user.getUserList({
                    "roles": [],
                    "tags": [],
                    "keyword": [],
                }))
                ctx.logger.info("Found users")
                reqTasks = mapping_tasks_request(task["tasks"], users)

                ctx.logger.info("Saving task")

                MAX_RETRIES = 5
                for attempt in range(MAX_RETRIES):
                    try:
                        ctx.logger.info("Save llm")
                        response = can_result(can_task.saveLlmTasks(
                            caller, 
                            project["id"],
                            reqTasks,
                        ))

                        ctx.logger.info("Return result")

                        result = {
                            "task_list": response,
                            "wants": (
                                "List all the tasks created above in a simple, easy-to-read format. "
                                "Make sure each task shows its title, short description, and due date clearly. "
                                "The output should be concise and structured as a clean task list."
                            )
                        }
                        break
                    except Exception as e:
                        ctx.logger.info(f"Attempt {attempt+1} failed: {e}")

                        if "timed out" in str(e).lower() or "deadline" in str(e).lower():
                            if attempt < MAX_RETRIES - 1:
                                sleep_time = 2 * (2 ** attempt)  # exponential backoff
                                print(f"Retrying in {sleep_time} seconds...")
                                time.sleep(sleep_time)
                            else:
                                raise # throw err when last attempt
                        else:
                            raise
        
        return result
    except Exception as e:
        raise Exception(f"ICP canister call failed: {str(e)}")

# MARK: Process query

async def process_query(query: str, ctx: Context) -> str:
    if "help" in query.lower():
        return help_message

    try:
        # Short-circuit: handle pending transfer confirmation flow first
        pending_project_detail = _get_pending_step(StepType.PROJECT_DETAIL.value, ctx)
        pending_transfer_icp = _get_pending_step(StepType.TRANSFER_ICP.value, ctx)

        if pending_project_detail or pending_transfer_icp:
            if (query or "").strip().lower() == "yes":
                func_name = pending_project_detail.get("next_call_func")
                ctx.logger.info(f"From pending going to tool: `{func_name}`")

                try:
                    result = await tool_handler(ctx, func_name, pending_project_detail.get("args"))
                    json_d = json.dumps(result)

                    # Get nicer final formatting from asi1
                    message = [
                        {"role": "system", "content": transfer_result},
                        {"role": "user", "content": json_d},
                    ]

                    _clear_pending_step(StepType.PROJECT_DETAIL.value, ctx)
                    _clear_pending_step(StepType.TRANSFER_ICP.value, ctx)

                    return _asi1_call(ctx, {
                        "model": "asi1-mini",
                        "messages": message,
                        "temperature": 0.3,
                        "max_tokens": 256,
                    })["content"]
                except Exception as e:
                    ctx.logger.error(f"Pending result error: `{str(e)}`")
                    _clear_pending_step(StepType.PROJECT_DETAIL.value, ctx)
                    _clear_pending_step(StepType.TRANSFER_ICP.value, ctx)
                    return error_message

        

        # Initial call to ASI1 with user query and tool
        system_message = {
            "role": "system",
            "content": (
                "Your name is Briqi. "
                "You can assist with Digital Asset Management, Project Management, and Team Operations. "
                "If the user needs detailed help, they can type 'help'."
            )
        }

        user_message = {"role": "user", "content": query}
        res_message = _asi1_call(ctx, {
            "model": "asi1-mini",
            "messages": [system_message, user_message],
            "tools": tools,
            "temperature": 0.2,
            "max_tokens": 1024
        })

        # Check is has message content, it means no tool involve/ordinary chat
        if res_message["content"]:
            return res_message["content"]

        # Parse tool calls from response
        tool_calls = res_message.get("tool_calls", [])
        messages_history = [user_message, res_message]

        if not tool_calls:
            return error_message

        # Step 3: Intercept transfer tools for confirmation; otherwise execute tools
        for tool_call in tool_calls:
            func_name = tool_call["function"]["name"]
            arguments = json.loads(tool_call["function"]["arguments"])
            tool_call_id = tool_call["id"]

            ctx.logger.info(f"Goint to tool: `{func_name}`")

            # match func_name:
            #     # Pending if its transfer tool
            #     case Tool.TRANSFER_ICP.value:
            #         _set_pending_step(StepType.TRANSFER_ICP.value ,ctx, {
            #             "func_name": func_name, 
            #             "args": arguments,
            #             "next_call_func": Tool.TRANSFER_ICP.value,
            #         })

            #         # Prepare data
            #         pvt_key = get_private_key_for_sender(ctx)
            #         canister_ledger = make_canister("icp_ledger", pvt_key)
            #         fee = unwrap_candid(canister_ledger.icrc1_fee())

            #         return set_confirmation_msg(arguments, e8s_to_icp(fee))

            # Non-transfer tool: execute immediately
            tool_message = {
                "role": "tool",
                "tool_call_id": tool_call_id,
            }

            try:
                result = await tool_handler(ctx, func_name, arguments)
                tool_message.update({"content": json.dumps(result)})
                ctx.logger.info(f"Tool: `{func_name}` success executing → {result}")
            except Exception as e:
                ctx.logger.error(f"Tool: `{func_name}` failed executing → {str(e)}")
                return error_message

            messages_history.append(tool_message)

        ctx.logger.info(messages_history)

        # Step 4: Send results back to ASI1 for final answer
        return _asi1_call(ctx, {
            "model": "asi1-mini",
            "messages": messages_history,
            "temperature": 0.7,
            "max_tokens": 2048
        })["content"]

    except Exception as e:
        ctx.logger.error(f"Error processing query: {str(e)}")
        return f"An error occurred while processing your request: {str(e)}"

# TODO: SEPARATE THIS
protocol = Protocol(spec=chat_protocol_spec)

@protocol.on_message(model=ChatMessage)
async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
    try:
        ctx.sender = sender
        ctx.logger.info(sender, msg.msg_id)

        # send the acknowledgement for receiving the message
        ack = ChatAcknowledgement(
            timestamp=datetime.now(timezone.utc),
            acknowledged_msg_id=msg.msg_id
        )
        await ctx.send(sender, ack)

        for item in msg.content:
            if isinstance(item, StartSessionContent):
                ctx.logger.info(f"Got a start session message from {sender}")

                identities = ctx.storage.get("identity") or []
                if not isinstance(identities, list):
                    identities = [identities]

                already_exists = any(
                    isinstance(item, dict) and item.get("sender") == sender
                    for item in identities
                )

                if already_exists:
                    ctx.logger.info(f"Identity already exists for {sender}")
                    continue

                identity = generate_ed25519_identity()
                identity.update({
                    "sender": sender
                })

                identities.append(identity)
                ctx.storage.set("identity", identities)

                continue
            elif isinstance(item, TextContent):
                response_text = await process_query(item.text, ctx)
                ctx.logger.info(f"Response text: {response_text}")
                response = ChatMessage(
                    timestamp=datetime.now(timezone.utc),
                    msg_id=uuid4(),
                    content=[TextContent(type="text", text=response_text)]
                )
                await ctx.send(sender, response)
            else:
                ctx.logger.info(f"Got unexpected content from {sender}")
    except Exception as e:
        ctx.logger.error(f"Error handling chat message: {str(e)}")
        error_response = ChatMessage(
            timestamp=datetime.now(timezone.utc),
            msg_id=uuid4(),
            content=[TextContent(type="text", text=f"An error occurred: {str(e)}")]
        )
        await ctx.send(sender, error_response)

@protocol.on_message(model=ChatAcknowledgement)
async def handle_chat_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"[handle_chat_acknowledgement] Received acknowledgement from {sender} for message {msg.acknowledged_msg_id}")
    if msg.metadata:
        ctx.logger.info(f"Metadata: {msg.metadata}")
