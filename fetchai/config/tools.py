from enum import Enum

class Tool(str, Enum):
    # Coin Tools
    GET_ICP_ADDRESS = "get_icp_address"
    GET_ICP_BALANCE = "get_icp_balance"
    TRANSFER_ICP = "transfer_icp"

    # App tools
    TASK_ANALYZER = "task_analyzer"
    GET_PROJECT_DETAIL = "get_project_detail"
    GENERATE_PROJECT = "generate_project"
    GENERATE_PROJECT_TASK = "generate_project_task"

    # Callback project detail
    BREAKDOWN_TASK = "breakdown_task"
    TASK_OVERVIEW = "task_overview"
    PAYOUT_TEAM = "payout_team"

tools = [
    # MARK: Get icp address
    {
        "type": "function",
        "function": {
            "name": Tool.GET_ICP_ADDRESS.value,
            "description": "Gets the ICP address of the user.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    
    # MARK: Get icp balance
    {
        "type": "function",
        "function": {
            "name": Tool.GET_ICP_BALANCE.value,
            "description": "Gets the balance of ICP.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
                "additionalProperties": False
            },
            "strict": True
        }
    },

    # MARK: Transfer icp value
    {
        "type": "function",
        "function": {
            "name": Tool.TRANSFER_ICP.value,
            "description": "Sends ICP from my wallet to a specified address.",
            "parameters": {
                "type": "object",
                "properties": {
                    "recipientAmount": {
                        "type": "string",
                        "description": "List of recipient address and amount (separated by '='), list separated by ','."
                    }
                },
                "required": ["recipientAmount"],
                "additionalProperties": False
            },
            "strict": True
        }
    },

    # MARK: Task analyzer
    {
        "type": "function",
        "function": {
            "name": Tool.TASK_ANALYZER.value,
            "description": "Analyze a task and provide a clear explanation of what needs to be done, including details and context.",
            "parameters": {
                "type": "object",
                "properties": {
                    "taskTitle": {
                        "type": "string",
                        "description": "The title or short summary of the task."
                    },
                    "taskDesc": {
                        "type": "string",
                        "description": "A detailed description or brief of the task to be analyzed."
                    }
                },
                "required": ["taskTitle", "taskDesc"],
                "additionalProperties": False
            },
            "strict": True
        }
    },


    # MARK: Get project detail
    {
        "type": "function",
        "function": {
            "name": Tool.GET_PROJECT_DETAIL.value,
            "description": "Get the project detail by given keyword name.",
            "parameters": {
                "type": "object",
                "properties": {
                    "keyword": {
                        "type": "string",
                        "description": "The name of the project, used as a search keyword"
                    }
                },
                "required": ["keyword"],
                "additionalProperties": False
            },
            "strict": True
        }
    },

    # MARK: Payout team
    {
        "type": "function",
        "function": {
            "name": Tool.PAYOUT_TEAM.value,
            "description": "Execute a project payout by sending ICP tokens from my wallet to the specified recipient addresses.",
            "parameters": {
                "type": "object",
                "properties": {
                    "recipientAmount": {
                        "type": "string",
                        "description": (
                            "A comma-separated list of recipient recipients with their payout amounts in ICP. "
                            "Each entry must follow the format 'principal=amount'. "
                            "Example: 'aaaaa-bbbbbb-ccccc=1.25, dddddd-eeeeee-fffff=0.75'."
                        )
                    },
                    "keyword": {
                        "type": "string",
                        "description": (
                            "The name of the project associated with this payout. "
                        )
                    },
                },
                "required": ["recipientAmount", "keyword"],
                "additionalProperties": False
            },
            "strict": True
        }
    },

    # MARK: Generate project
    {
        "type": "function",
        "function": {
            "name": Tool.GENERATE_PROJECT.value,
            "description": "Create a project with a name, reward amount, and optional brief description.",
            "parameters": {
                "type": "object",
                "properties": {
                    "projectName": {
                        "type": "string",
                        "description": "The name of the project."
                    },
                    "brief": {
                        "type": "string",
                        "description": "A short description of the project."
                    },
                    "reward": {
                        "type": "integer",
                        "description": "The reward amount for the project."
                    },
                    "startDate": {
                        "type": "string",
                        "description": "The user-friendly start date of the project (e.g., '2025-09-20')."
                    },
                    "endDate": {
                        "type": "string",
                        "description": "The user-friendly end date of the project (e.g., '2025-10-20')."
                    }
                },
                "required": ["projectName", "brief"],
                "additionalProperties": False
            },
            "strict": True
        }
    },

    # MARK: Generate task
    {
        "type": "function",
        "function": {
            "name": Tool.GENERATE_PROJECT_TASK.value,
            "description": "Generate project subtasks by breaking down a high-level project brief into actionable items. Useful for helping teams who are not yet experienced in task decomposition.",
            "parameters": {
                "type": "object",
                "properties": {
                    "keyword": {
                        "type": "string",
                        "description": "The name of the project that will be used as context for the task generation."
                    },
                    "brief": {
                        "type": "string",
                        "description": "A high-level description of the project, which the AI will break down into smaller actionable subtasks."
                    }
                },
                "required": ["keyword", "brief"],
                "additionalProperties": False
            },
            "strict": True
        }
    }
]