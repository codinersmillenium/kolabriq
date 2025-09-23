from pydantic import BaseModel
from typing import List

from openai import pydantic_function_tool
from ic.principal import Principal

class Task(BaseModel):
    task_title: str
    task_desc: str
    task_tag: str
    due_date: int

class TaskList(BaseModel):
    tasks: List[Task]

# MARK: Pre agent brief

def task_tool() -> any:
    return pydantic_function_tool(
        TaskList,
        name="tasks",
        description=(
            "Break down a project brief into a structured task list. "
            "Each task must include: title, description, tag (choose only from ui, frontend, backend, or business_analyst), "
            "and a due date in epoch seconds (must be a valid future date). "
            "Tasks should be small, actionable, and logically ordered from planning to testing. "
            "Include both technical and non-technical tasks to make the plan executable."
        )
    )

def mapping_tasks_request(tasks: List[Task], users: List[dict]) -> List[dict]:
    mapped = []

    for task in tasks:
        # Find user based on their tag and not admin
        assignees = [
            Principal.to_str(user["id"])
            for user in users
            if "admin" not in user.get("role", {}) 
            and any(task["task_tag"] in tag for tag in user.get("tags", []))
        ]

        # If not match → fallback to user[0]
        if not assignees and users:
            assignees = [Principal.to_str(users[0]["id"])]

        mapped.append({
            "projectId": 0,  # Will be updated with actual project ID
            "title": task["task_title"],
            "desc": task["task_desc"],
            "tag": {task["task_tag"]: None},
            "dueDate": int(task["due_date"]),
            "assignees": assignees
        })

    return mapped