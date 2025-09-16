import TypCommon "../common/type";

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

    // MARK: Project

    public type Project = {
		id          : TypCommon.ProjectId;
        ownerId     : TypCommon.UserId;
        name        : Text;
        desc        : Text;
        tags        : [TypCommon.Tags];
		status      : ProjectStatus;
        projectType : ProjectType;
		reward      : Nat;
        thumbnail   : Blob;
        createdBy   : TypCommon.UserId;
        action      : ProjectAction;
    };

    // For project audit trail
    public type ProjectAction = {
        #create;
        #statusUpdate:   { from: ProjectStatus; to: ProjectStatus };
        #metadataUpdate: { field: Text; oldValue: Text; newValue: Text };
    };

    public type ProjectFilter = {
        keyword     : ?Text;
		tags        : ?[TypCommon.Tags];
		status      : ?ProjectStatus;
        projectType : ?ProjectType;
	};

    public type ProjectRequest = {
        name        : Text;
        desc        : Text;
        tags        : [TypCommon.Tags];
        projectType : ProjectType;
        reward      : Nat;
        thumbnail   : Blob;
    };

    // MARK: Payout

    public type PayoutRequest = {
        userId : TypCommon.UserId;
        reward : Nat;
    };

    // MARK: Timeline

    public type Timeline = {
        id        : TypCommon.TimelineId;
		projectId : TypCommon.ProjectId;
        title     : Text;
        startDate : Int;
        endDate   : Int;
        createdBy : TypCommon.UserId;
        action    : TimelineAction;
    };

    // For timeline audit trail
    public type TimelineAction = {
        #create;
        #dateUpdate:     { field: Text; oldValue: Int; newValue: Int };
        #metadataUpdate: { field: Text; oldValue: Text; newValue: Text };
    };

    public type TimelineRequest = {
        title     : Text;
        startDate : Int;
        endDate   : Int;
    };
    
    // MARK: Team assigness

    public type TeamAssignment = {
        projectId  : TypCommon.ProjectId;
        userId     : TypCommon.UserId;
        assignedBy : TypCommon.UserId;
        action     : TeamAction;
    };

    // For timeline audit trail
    public type TeamAction = {
        #assign;
        #unassign;
    };

    // MARK: Block

    // Blockchain Block Structure for Projects, Timelines & Team assigness
    public type ProjectBlock = {
        id           : TypCommon.BlockId;
        previousHash : Text;
        data         : ProjectBlockData;
        hash         : Text;
        signature    : Text;
        timestamp    : Int;               // When block was created
        nonce        : Nat;               // For proof-of-work
    };

    // Union type for different data types in blockchain
    public type ProjectBlockData = {
        #project        : Project;
        #timeline       : Timeline;
        #teamAssignment : TeamAssignment;
    };

    // MARK: LLM

    public type LLMSaveResponse = {
        project   : Project;
        startDate : Int;
        endDate   : Int;
    };
};