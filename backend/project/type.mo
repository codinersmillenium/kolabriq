import TypCommon "../common/type";
import TypTask "../task/type";
import TypUser "../user/type";

module {
    public type ProjectStatus = {
        #new;
        #in_progress;
        #review;
        #done;
    };

    public type ProjectType = {
        #free;
        #rewarded;
    };

    public type Project = {
		id          : TypCommon.ProjectId;
        ownerId     : TypCommon.UserId;
        name        : Text;
        desc        : Text;
        tags        : [TypCommon.Tags];
		status      : ProjectStatus;
        projectType : ProjectType;
		reward      : Nat;
        isCompleted : Bool;
        createdAt   : Int;
        createdById : TypCommon.UserId;
        updatedAt   : ?Int;
        updatedById : ?TypCommon.UserId;
        // TODO : Image
    };

    public type ProjectFilter = {
        keyword     : Text;
		tags        : [TypCommon.Tags];
		status      : ProjectStatus;
        projectType : ProjectType;
	};

    public type ProjectList = {
		id          : TypCommon.ProjectId;
        ownerId     : TypCommon.UserId;
        name        : Text;
        desc        : Text;
        projectType : ProjectType;
		reward      : Nat;
        isCompleted : Bool;
        teams       : [TypUser.UserResponse];
        totalTask   : Nat;
        createdAt   : Int;
        createdById : TypCommon.UserId;
    };

    public type ProjectRequest = {
        name        : Text;
        desc        : Text;
        tags        : [TypCommon.Tags];
        projectType : ProjectType;
        reward      : Nat;
    };

    public type ProjectResponseFromLLM = {
        name : Text;
        tags : [TypCommon.Tags];
    };

    public type ProjectResponse = {
		id          : TypCommon.ProjectId;
        ownerId     : TypCommon.UserId;
        name        : Text;
        tags        : [TypCommon.Tags];
		status      : ProjectStatus;
        projectType : ProjectType;
		reward      : Nat;
        isCompleted : Bool;
        teams       : [TypUser.UserResponse];
        totalTasks  : Nat;
        tasks       : [TypTask.TaskResponse];
        createdAt   : Int;
        createdById : TypCommon.UserId;
        updatedAt   : ?Int;
        updatedById : ?TypCommon.UserId;
        // TODO : Image
    };

    public type PayoutRequest = {
        userId : TypCommon.UserId;
        reward : Nat;
    };

    public type Timeline = {
        id         : TypCommon.TimelineId;
        title      : Text;
        startDate : Int;
        endDate   : Int;
    };

    public type TimelineRequest = {
        title      : Text;
        startDate : Int;
        endDate   : Int;
    };

    public type TimelineResponseFromLLM = {
        title      : Text;
        startDate : Int;
        endDate   : Int;
    };
};