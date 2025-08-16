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
        thumbnail   : Blob;
        createdAt   : Int;
        createdById : TypCommon.UserId;
        updatedAt   : ?Int;
        updatedById : ?TypCommon.UserId;
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
		status      : ProjectStatus;
        projectType : ProjectType;
		reward      : Nat;
        isCompleted : Bool;
        thumbnail   : Blob;
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
        thumbnail   : Blob;
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
        thumbnail   : Blob;
        teams       : [TypUser.UserResponse];
        totalTasks  : Nat;
        tasks       : [TypTask.TaskResponse];
        createdAt   : Int;
        createdById : TypCommon.UserId;
        updatedAt   : ?Int;
        updatedById : ?TypCommon.UserId;
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