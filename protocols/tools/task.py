from pydantic import BaseModel
from typing import List

from openai import pydantic_function_tool

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

def mapping_tasks_request(tasks: List[Task]) -> List[dict]:
    return [
        {
            "projectId": 0,  # Will be updated with actual project ID
            "title": task["task_title"],
            "desc": task["task_desc"],
            "tag": { task["task_tag"]: None },
            "dueDate": int(task["due_date"]),
            "assignees": []
        }
        for task in tasks
    ]