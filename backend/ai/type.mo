import TypProject "../project/type";
import TypTask "../task/type";

module {
    public type ResponseProjectLLM = {
        project   : TypProject.ProjectResponseFromLLM;
        timelines : [TypProject.TimelineResponseFromLLM];
        tasks     : [TypTask.TaskResponseFromLLM];
    }
}