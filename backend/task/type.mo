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
        projectId   : TypCommon.ProjectId;
        title       : Text;
        description : Text;
        taskTag     : TypCommon.Tags;
		status      : TaskStatus;
        dueDate     : Int;
        priority    : Bool; 
        assignees   : [TypCommon.UserId];
        doneAt      : ?Int;
        doneById    : ?TypCommon.UserId;
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
        projectId   : TypCommon.ProjectId;
		title       : Text;
		description : Text;
        taskTag     : TypCommon.Tags;
        dueDate     : Int;
        assignees   : [TypCommon.UserId]; 
	};

    public type TaskResponse = {
		id          : TypCommon.TaskId;
        projectId   : TypCommon.ProjectId;
        title       : Text;
        description : Text;
        taskTag     : TypCommon.Tags;
		status      : TaskStatus;
        dueDate     : Int;
        priority    : Bool;
        isOverdue   : Bool;
        assignees   : [TypUser.UserResponse];
        doneAt      : ?Int;
        review      : ?TaskReview;
    };

    public type TaskResponseFromLLM = {
		title       : Text;
		description : Text;
        taskTag     : TypCommon.Tags;
        dueDate     : Int;
        priority    : Bool;
	};

    public type TaskReview = {
        id          : TypCommon.TaskId;
		taskId      : TypCommon.TaskId;
        review      : Text;
        fixedAt     : ?Int;
        fixedById   : ?TypCommon.UserId;
        createdAt   : Int;
        createdById : TypCommon.UserId;
        updatedAt   : ?Int;
        updatedById : ?TypCommon.UserId;
    };

    public type TaskReviewRequest = {
		taskId : TypCommon.TaskId;
        review : Text;
    };

    public type OverviewError = {
        #notFound;
        #notDone;
        #found;
    };

    public type UserOverview = {
        userId            : TypCommon.UserId;
        totalTask         : Nat;
		totalDone         : Nat;
        totalOverdue      : Nat;
        avgCompletingTime : Int;
    };

    public type HistoryCategory = {
        #in_progress;
        #done;
        #correction;
    };

    public type TaskHistory = {
        id        : TypCommon.TaskHistoryId;
		taskId    : TypCommon.TaskId;
        category  : HistoryCategory;
        timestamp : Int;
        username  : Text;
    };
};