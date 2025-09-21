import TypCommon "../common/type";
import Principal "mo:base/Principal";

module {
    // MARK: Task status
    public type TaskStatus = {
        #todo;
        #in_progress;
        #done;
    };

    // MARK: Task

    public type Task = {
		id          : TypCommon.TaskId;
        projectId   : TypCommon.ProjectId;
        title       : Text;
        desc        : Text;
        tag         : TypCommon.Tags;
		status      : TaskStatus;
        priority    : Bool; 
        assignees   : [TypCommon.UserId];
        dueDate     : Int;
        doneAt      : ?Int;
        doneById    : ?TypCommon.UserId;
        createdById : TypCommon.UserId;
        action      : TaskAction;
    };

    // For task audit trail
    public type TaskAction = {
        #create;
        #statusUpdate   : { from: TaskStatus; to: TaskStatus };
        #assigneeUpdate : { added: [TypCommon.UserId]; removed: [TypCommon.UserId] };
        #metadataUpdate : { field: Text; oldValue: Text; newValue: Text };
    };

    public type TaskFilter = {
        keyword : ?Text;
		status  : ?[TaskStatus];
        tag     : ?[TypCommon.Tags];
	};

    public type TaskRequest = {
        projectId : Nat;
		title     : Text;
		desc      : Text;
        tag       : TypCommon.Tags;
        dueDate   : Int;
        assignees : [Principal]; 
	};
    // MARK: Review

    public type Review = {
        id         : TypCommon.ReviewId;
		taskId     : TypCommon.TaskId;
        review     : Text;
        reviewerId : TypCommon.UserId;
        fixedAt    : ?Int;
        fixedById  : ?TypCommon.UserId;
        action     : ReviewAction;
    };

    public type ReviewAction = {
        #create;
        #fix:    { fixedBy: TypCommon.UserId };
        #update: { oldReview: Text; newReview: Text };
    };

    public type TaskReviewRequest = {
		taskId : Nat;
        review : Text;
    };

    // MARK: Overview

    public type OverviewError = {
        #not_found;
        #not_done;
        #found;
    };

    public type UserOverview = {
        userId       : TypCommon.UserId;
        totalTask    : Nat;
		totalDone    : Nat;
        totalOverdue : Nat;
    };

    // MARK: Block

    // Block Structure for Projects & Timelines
    public type TaskBlock = {
        id           : Nat; 
        previousHash : Text;
        data         : TaskBlockData;
        hash         : Text;
        signature    : Text;
        timestamp    : Int;
        nonce        : Nat;
    };

    // Union type for different data types in blockchain
    public type TaskBlockData = {
        #task   : Task;
        #review : Review;
    };
};