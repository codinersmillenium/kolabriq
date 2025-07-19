import TypCommon "../common/type";
import TypUser "../user/type";

module {
    public type ProjectStatus = {
        #new;
        #in_progress;
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
        tags        : [TypCommon.Tags];
		status      : ProjectStatus;
        projectType : ProjectType;
		reward      : Nat;
        isCompleted : Bool;
        isPublic    : Bool;
        tasks       : [TypCommon.TaskId];
        createdAt   : Int;
        createdById : Int;
        updatedAt   : ?Int;
        updatedById : ?TypCommon.UserId;
        // TODO : Image
        // TODO : Timeline
    };

    public type ProjectList = {
		id          : TypCommon.ProjectId;
        ownerId     : TypCommon.UserId;
        name        : Text;
        projectType : ProjectType;
		reward      : Nat;
        isCompleted : Bool;
        teams       : [TypUser.User]
    };

    public type ProjectRequest = {
        name        : Text;
        tags        : [TypCommon.Tags];
        projectType : ProjectType;
        reward      : Nat;
        isPublic    : Bool;
    };

    public type ProjectFilter = {
        name        : Text;
        tags        : [TypCommon.Tags];
        projectType : ProjectType;
        reward      : Nat;
        isPublic    : Bool;
    };
};