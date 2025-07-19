import TypCommon "../common/type";
import TypUser "../user/type";

module {
    public type TaskStatus = {
        #todo;
        #in_progress;
        #done;
    };

    public type Task = {
		id          : TypCommon.TaskId;
        idProject   : TypCommon.ProjectId;
        title       : Text;
        description : Text;
        taskTag     : TypCommon.Tags;
		status      : TaskStatus;
        dueDate     : Int;
        priority    : Bool; 
        assignees   : [TypCommon.UserId];
        doneAt      : ?Int;
        createdAt   : Int;
        createdById : TypCommon.UserId;
        updatedAt   : ?Int;
        updatedById : ?TypCommon.UserId;
    };

    public type TaskFilter = {
        keyword : Text;
		status  : [TaskStatus];
        taskTag : [TypCommon.Tags];
	};

    public type TaskRequest = {
        idProject   : TypCommon.ProjectId;
		title       : Text;
		description : Text;
        taskTag     : TypCommon.Tags;
        dueDate     : Int;
        assignees   : [TypCommon.UserId]; 
	};

    public type TaskResponse = {
		id          : TypCommon.TaskId;
        idProject   : TypCommon.ProjectId;
        title       : Text;
        description : Text;
        taskTag     : TypCommon.Tags;
		status      : TaskStatus;
        dueDate     : Int;
        priority    : Bool;
        isOverdue   : Bool;
        assignees   : [TypUser.UserResponse];
        doneAt      : ?Int;
    };
};