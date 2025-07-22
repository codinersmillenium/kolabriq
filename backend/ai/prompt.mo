import Text "mo:base/Text";
module {
    /**
    * list short and light prompt. Can be enhance in next future with adequate resources 🙉 
    */
    public let TASK_ASSISTANT = "Break down this ambitious request into clear, doable tasks without rejecting the tone or idea: [task_name]";
    public let GAMIFIED_COACH   = "Task '[task_name]' completed! Give a short RPG-style message with XP gained and stat boost.";
    public let PROJECT_ANALYZER = "review tasks and timeline below. Who's overloaded? Any task outside phase? Suggest improvements.";
    public let TASKS_COMPLETED = "all my tasks are done. Start with a congratulatory message, then give me a short funny poem about being gloriously lazy.";
    public let TASKS_REMAINED = "here are my tasks in one line each. Which should I do first? Give a short reason.";

    public func getTaskAssistPrompt(task : Text) : Text {
        return Text.replace(TASK_ASSISTANT, #text "[task_name]", task);
    };

    public func getGamifiedCoach(task : Text) : Text {
        return Text.replace(GAMIFIED_COACH, #text "[task_name]", task);
    };
}
