import os, base64

from datetime import datetime, timedelta

from pydantic import BaseModel
from enum import Enum
from typing import List, Dict, Any

from openai import pydantic_function_tool

from protocols.tools.task import Task

from utils.coin import icp_to_e8s

class ProjectType(str, Enum):
    free = "free"
    rewarded = "rewarded"

class ProjectTags(str, Enum):
    ui = "ui"
    frontend = "frontend"
    backend = "backend"
    business_analyst = "business_analyst"

class Timeline(BaseModel):
    title: str
    startDate: int
    endDate: int

class Project(BaseModel):
    project_name: str
    project_desc: str
    project_tags: List[ProjectTags]
    project_type: ProjectType
    reward: float
    tasks: List[Task]
    timelines: List[Timeline]

# MARK: Pre agent brief

def project_tool() -> any:
    return pydantic_function_tool(
        Project,
        name="project",
        description = (
            "Generate a project plan with these rules: "
            "- Include 4 to 6 tasks, each with a due_date in 10-digit epoch (day precision). "
            "- Tags can be ui, frontend, backend, or business_analyst. "
            "- Add multiple timelines (at least 2) that cover all tasks. "
            "- Timelines must be sequential: first starts at the earliest task due_date, last ends a bit after the latest task due_date (buffer time). "
            "- Each timeline should have a clear milestone name and connect end-to-start without overlapping. "
            "- If reward = 0 then project_type = free, otherwise project_type = rewarded. "
            "- If project_type is rewarded, reduce the reward by a fee of 0.0001."
        )
    )

def get_project_brief(args: any) -> str:
    user_brief = f"New project called '{args['projectName']}'"

    if args.get("reward"):
        user_brief += f" with reward of {args['reward']} ICP"
    else:
        user_brief += " with no reward"

    if args.get("brief"):
        user_brief += f" and a project brief: {args['brief']}"

    # Handle startDate and endDate (user-friendly string)
    if args.get("startDate"):
        start_date_str = args["startDate"]
    else:
        # Default = 3 weeks from now
        start_date = datetime.now() + timedelta(weeks=3)
        start_date_str = start_date.strftime("%Y-%m-%d")

    if args.get("endDate"):
        end_date_str = args["endDate"]
    else:
        # Default = startDate + 30 days
        end_date = datetime.strptime(start_date_str, "%Y-%m-%d") + timedelta(days=30)
        end_date_str = end_date.strftime("%Y-%m-%d")

    user_brief += f". The project should start at {start_date_str} and end by {end_date_str}."

    return user_brief

# MARK: Handle response

def mapping_project_request(project: Project) -> dict:
    # Get default project thumbnail
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    asset_path = os.path.join(BASE_DIR, "../../../", "assets", "default.jpg")

    with open(asset_path, "rb") as f:
        file_bytes = f.read()

    paramProject = {
        "name": project["project_name"],
        "desc": project["project_desc"],
        "tags": [],
        "projectType": { project["project_type"]: None },
        "reward": icp_to_e8s(project["reward"]),
        "thumbnail": file_bytes,
    }

    for tag in project["project_tags"]:
        paramProject["tags"].append({ tag: None })

    return paramProject

def mapping_timelines_request(timelines: List[Timeline]) -> List[dict]:
    return [
        {
            "title": timeline["title"],
            "startDate": int(timeline["startDate"]),
            "endDate": int(timeline["endDate"]),
        }
        for timeline in timelines
    ]

def separate_recipient_amount(strArgs: str) -> List[Dict[str, Any]]:
    # ',' split to get list of recipient=amount
    parts = strArgs.split(",")
    
    result = []
    for p in parts:
        recipient, amount = p.split("=")
        result.append({
            "recipient": recipient.strip(),
            "amount": icp_to_e8s(float(amount.strip()))
        })
    
    return result
