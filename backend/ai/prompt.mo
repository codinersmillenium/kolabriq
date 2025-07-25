import Text "mo:base/Text";
module {
    /**
    * list short and light prompt. Can be enhance in next future with adequate resources 🙉 
    */
    // TODO: FIX ADD SHORT
    public let PROJECT_PLANNER  = "Project planner: create a project theme about this [theme]. Generate a project with 2 task title, 2 task tags and 3 timelines title";
    public let TASK_ASSISTANT   = "user dont understood this task, give a short description on this task: [task_name]";
    public let GAMIFIED_COACH   = "Task '[task_name]' completed! Give a short RPG-style message with XP gained and stat boost.";
    public let PROJECT_ANALYZER = "review tasks and timeline below. if users exists give name who's overloaded?. give a very short is project should be rearrange or not.";
    public let TASKS_COMPLETED  = "all my tasks are done. Start with a congratulatory message, then give me a short funny poem about being gloriously lazy.";
    public let TASKS_REMAINED   = "here are my tasks in one line each. Which should I do first? Give a short reason.";

    public func getPlannerPrompt(theme : Text) : Text {
        return Text.replace(PROJECT_PLANNER, #text "[theme]", theme);
    };

    public func getTaskAssistPrompt(task : Text) : Text {
        return Text.replace(TASK_ASSISTANT, #text "[task_name]", task);
    };

    public func getGamifiedCoach(task : Text) : Text {
        return Text.replace(GAMIFIED_COACH, #text "[task_name]", task);
    };
}
