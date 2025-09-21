import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Blob "mo:base/Blob";

import TypCommon "../common/type";
import TypTask "type";

import SvcTask "service";

import UtlTask "util";
import UtlCommon "../common/util";
import Utl "../utils/helper";


persistent actor {
    private var nextBlockCounter : TypCommon.BlockId  = 0;
    private var nextTaskId       : TypCommon.TaskId   = 1;
    private var nextReviewId     : TypCommon.ReviewId = 1;

    private var stableBlockchain       : [SvcTask.StableBlockchain]       = [];
    private var stableTaskIndex        : [SvcTask.StableTaskIndex]        = [];
    private var stableReviewIndex      : [SvcTask.StableReviewIndex]      = [];
    private var stableTaskReviewIndex  : [SvcTask.StableTaskReviewIndex]  = [];
    private var stableProjectTaskIndex : [SvcTask.StableProjectTaskIndex] = [];

    transient let task = SvcTask.Task(
        nextBlockCounter,
        nextTaskId,
        nextReviewId,
        stableBlockchain, 
        stableTaskIndex, 
        stableReviewIndex,
        stableTaskReviewIndex,
        stableProjectTaskIndex,
    );

    // MARK: System

    system func preupgrade() {
        // Save all HashMap data to stable variables
        stableBlockchain       := Iter.toArray(task.blockchain.entries());
        stableTaskIndex        := Iter.toArray(task.taskIndex.entries());
        stableReviewIndex      := Iter.toArray(task.reviewIndex.entries());
        stableTaskReviewIndex  := Iter.toArray(task.taskReviewIndex.entries());
        stableProjectTaskIndex := Iter.toArray(task.projectTaskIndex.entries());
    };

    system func postupgrade() {
        // Restore data from stable variables to HashMaps
        task.blockchain := HashMap.fromIter<Blob, TypTask.TaskBlock>(
            stableBlockchain.vals(), 
            stableBlockchain.size(), 
            Blob.equal, 
            Blob.hash
        );
        
        task.taskIndex := HashMap.fromIter<Blob, [Blob]>(
            stableTaskIndex.vals(),
            stableTaskIndex.size(),
            Blob.equal,
            Blob.hash
        );
        
        task.reviewIndex := HashMap.fromIter<Blob, [Blob]>(
            stableReviewIndex.vals(),
            stableReviewIndex.size(),
            Blob.equal,
            Blob.hash
        );
        
        task.taskReviewIndex := HashMap.fromIter<Blob, [TypCommon.ReviewId]>(
            stableTaskReviewIndex.vals(),
            stableTaskReviewIndex.size(),
            Blob.equal,
            Blob.hash
        );
        
        task.projectTaskIndex := HashMap.fromIter<Blob, [TypCommon.TaskId]>(
            stableProjectTaskIndex.vals(),
            stableProjectTaskIndex.size(),
            Blob.equal,
            Blob.hash
        );
        
        // Clear stable variables to free memory (after restoration)
        stableBlockchain       := [];
        stableTaskIndex        := [];
        stableReviewIndex      := [];
        stableTaskReviewIndex  := [];
        stableProjectTaskIndex := [];
    };

    // MARK: Get task list
    
    public query func getTaskList(
        projectId : Nat,
        filter    : ?TypTask.TaskFilter,
    ) : async Result.Result<[TypTask.Task], ()> {
        switch(task.projectTaskIndex.get(Utl.natToBlob(projectId))) {
            case(null)     { return #ok([]) };
            case(?taskIds) {
                let result = Array.mapFilter<TypCommon.TaskId, TypTask.Task>(
                    taskIds,
                    func(taskId: TypCommon.TaskId): ?TypTask.Task {
                        switch (task.getCurrentTaskState(taskId)) {
                            case (null)  { null; };
                            case (?data) {
                                switch(filter) {
                                    case (null) { ?data; };
                                    case (?f)   {
                                        // Keyword filter
                                        let keywordMatch = switch (f.keyword) {
                                            case (null)     { true; };
                                            case (?keyword) { 
                                                if (keyword == "") { 
                                                    true;
                                                } else {
                                                    Text.contains(data.title, #text keyword) or
                                                    Text.contains(data.desc, #text keyword); 
                                                };
                                            };
                                        };
                                        
                                        // Status filter  
                                        let statusMatch = switch (f.status) {
                                            case (null)        { true; };
                                            case (?statusList) { 
                                                if (statusList.size() == 0) {
                                                    true;
                                                } else {
                                                    (Array.find<TypTask.TaskStatus>(statusList, func s = s == data.status)) != null
                                                };
                                            };
                                        };
                                        
                                        // Tags filter  
                                        let tagsMatch = switch (f.tag) {
                                            case (null)        { true; };
                                            case (?tagsList) { 
                                                if (tagsList.size() == 0) {
                                                    true;
                                                } else {
                                                    (Array.find<TypCommon.Tags>(tagsList, func s = s == data.tag)) != null
                                                };
                                            };
                                        };
                                        
                                        // ALL conditions must be true (AND logic)
                                        if (keywordMatch and statusMatch and tagsMatch) {
                                            return ?data;
                                        };
                                        
                                        null;
                                    };
                                };
                            }
                        };
                    }
                );

                return #ok(result);
            };
        };
	};

    // MARK: Create task

    public shared ({caller}) func createTask(
        req : TypTask.TaskRequest,
    ) : async Result.Result<TypTask.Task, Text> {
        if (not task.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };

        return #ok(task.createTask(caller, req));
	};

    // MARK: Get task by keyword

    public query func getTaskByKeyword(
        projectId : Nat,
        keyword   : Text,
    ) : async Result.Result<TypTask.Task, Text>  {
        switch (task.projectTaskIndex.get(Utl.natToBlob(projectId))) {
            case (null)     { return #err("Task not found"); };
            case (?taskIds) {
                let lowerKeyword = Text.toLowercase(keyword);
                for(taskId in taskIds.vals()) {
                    switch (task.getCurrentTaskState(taskId)) {
                        case (null)  { };
                        case (?data) {
                            if (
                                Text.contains(Text.toLowercase(data.title), #text lowerKeyword) or
                                Text.contains(Text.toLowercase(data.desc), #text lowerKeyword) 
                            ) {
                                return #ok(data);
                            }
                        };
                    };
                };
            };
        };

        return #err("Task not found");
    };

    // MARK: Get task detail

    public query func getTaskDetail(
        taskId : Nat,
    ) : async Result.Result<TypTask.Task, Text>  {
        switch(task.getCurrentTaskState(taskId)) {
            case(null)  { return #err("Task not found"); };
            case(?data) { return #ok(data); };
        };
    };

    // MARK: Update metadata
    
    public shared ({caller}) func updateTaskMetadata(
        taskId : Nat,
        req    : TypTask.TaskRequest,
    ) : async Result.Result<TypTask.Task, Text> {
        if (not task.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };
        
        switch(task.getCurrentTaskState(req.projectId)) {
            case(null)  { return #err("Task not found") };
            case(?data) { return #ok(task.updateMetadata(caller, data, req)); };
        };
    };

    // MARK: Update status
    
    public shared ({caller}) func updateTaskStatus(
        taskId    : Nat,
        reqStatus : TypTask.TaskStatus,
    ) : async Result.Result<TypTask.Task, Text> {
        if (not task.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };
        
        switch(task.getCurrentTaskState(taskId)) {
            case(null)  { return #err("Task not found") };
            case(?data) { return #ok(task.updateStatus(caller, data, reqStatus)); };
        };
    };

    // MARK: Get riviews task
    
    public query func getTaskReviews(
        taskId : Nat,
    ) : async Result.Result<[TypTask.Review], Text> {
        switch (task.getCurrentTaskState(taskId)) {
            case (null)  { return #err("Task not found"); };
            case (?_) {
                switch (task.taskReviewIndex.get(Utl.natToBlob(taskId))) {
                    case (null)       { #ok([]); };
                    case (?reviewIds) {
                        let reviews = Array.mapFilter<TypCommon.ReviewId, TypTask.Review>(
                            reviewIds,
                            func reviewId = task.getCurrentReviewState(taskId)
                        );

                        return #ok(reviews);
                    };
                };
            };
        };
	};

    // MARK: Get task history

    public query func getTaskHistory(
        taskId : Nat,
    ) : async Result.Result<[TypTask.TaskBlock], Text> {
        switch (task.taskIndex.get(Utl.natToBlob(taskId))) {
            case (null)      { #err("Task not found"); };
            case (?blockIds) {
                let blocks = Array.mapFilter<Blob, TypTask.TaskBlock>(
                    blockIds,
                    func blockId = task.blockchain.get(blockId)
                );

                return #ok(blocks);
            };
        };
    };

    // MARK: Add task review

    public shared ({caller}) func addReview(
        req : TypTask.TaskReviewRequest,
    ) : async Result.Result<TypTask.Review, Text> {
        if (not task.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };
        
        switch(task.getCurrentTaskState(req.taskId)) {
            case(null) { return #err("Task not found") };
            case(?_)   {  return #ok(task.addReview(caller, req)); };
        };
    };

    // MARK: Update review
    
    public shared ({caller}) func updateReview(
        reviewId : Nat,
        req      : TypTask.TaskReviewRequest,
    ) : async Result.Result<TypTask.Review, Text> {
        if (not task.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };
        
        switch(task.getCurrentReviewState(reviewId)) {
            case(null)  { return #err("Task not found") };
            case(?data) {  return #ok(task.updateReview(caller, data, req)); };
        };
    };

    // MARK: Mark review fixed
    
    public shared ({caller}) func updateReviewFixed(
        reviewId : Nat,
    ) : async Result.Result<TypTask.Review, Text> {
        if (not task.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };
        
        switch(task.getCurrentReviewState(reviewId)) {
            case(null)  { return #err("Task not found") };
            case(?data) {  return #ok(task.updateReviewFixed(caller, data)); };
        };
    };

    // MARK: Get review history

    public query func getReviewHistory(
        reviewId : Nat,
    ) : async Result.Result<[TypTask.TaskBlock], Text> {
        switch (task.reviewIndex.get(Utl.natToBlob(reviewId))) {
            case (null)      { #err("Review not found"); };
            case (?blockIds) {
                let blocks = Array.mapFilter<Blob, TypTask.TaskBlock>(
                    blockIds,
                    func blockId = task.blockchain.get(blockId)
                );

                return #ok(blocks);
            };
        };
    };

    // MARK: Get user overview

    public query func getUserOverview(
        projectId : Nat, 
    ) : async Result.Result<[TypTask.UserOverview], Text> {
        let (result, error) = task.userOverview(projectId);
        if (error == #found) return #ok(result);

        return #err(UtlTask.translateOverviewError(error));
    };

    // MARK: Health

    public query func healthCheck(): async {
        totalBlocks    : Nat;
        chainIntegrity : Bool;
        lastBlockHash  : Text;
        totalTasks     : Nat;
        totalReviews   : Nat;
    } {
        let integrity    = task.verifyChainIntegrity();
        let blockCounter = task.blockCounter;
        let lastHash     = if (blockCounter > 0) {
            let prevBlockKey = Nat.sub(blockCounter, 1);
            switch (task.blockchain.get(Utl.natToBlob(prevBlockKey))) {
                case (null)   { "No blocks" };
                case (?block) { block.hash };
            };
        } else {
            UtlCommon.GENESIS_HASH;
        };
        
        return {
            totalBlocks    = blockCounter;
            chainIntegrity = integrity;
            lastBlockHash  = lastHash;
            totalTasks  = task.taskIndex.size();
            totalReviews = task.reviewIndex.size();
        };
    };

    /**
     *  MARK: Project Analysis
     *
     *  This function generates a summary of tasks inside a project.
     *  - It fetches all tasks by project ID.
     *  - It skips completed tasks (#done).
     *  - For each task, it lists title, status, due date, priority, and assignees.
     *  - The result is a single text string useful for analysis or AI prompts.
     */
    public query func projectAnalysis(
        projectId : Nat, 
        // projectId : TypCommon.ProjectId,
    ) : async Text {
        switch(task.projectTaskIndex.get(Utl.natToBlob(projectId))) {
            case(null)     { return "Project didnt has task" };
            case(?taskIds) {
                // Prepare task description from the template
                let baseTaskQuery  = "Task [index]: [title] | Status: [status] | Due: [dueDate] | Priority: [priority]";
                var tasksQueryList = "";
                var idx = 1;

                label loopTask for(taskId in taskIds.vals()) {
                    switch (task.getCurrentTaskState(taskId)) {
                        case (null)  {  };
                        case (?task) {
                            if (task.status == #done) continue loopTask;

                            // TODO: NEXT PAKE USERNAME
                            let taskAssigness  = Array.map<TypCommon.UserId, Text>(task.assignees, func user = Principal.toText(user));
                            let queryAssigness = if (taskAssigness.size() > 0) " | Assigness: " # Text.join(",", taskAssigness.vals()) else "";
                            let priority       = if (task.priority) "yes" else "no";

                            // Replace placeholders with real values
                            var tasksQuery = baseTaskQuery;
                            tasksQuery := Text.replace(tasksQuery, #text "[index]", Int.toText(idx));
                            tasksQuery := Text.replace(tasksQuery, #text "[title]", task.title);
                            tasksQuery := Text.replace(tasksQuery, #text "[status]", UtlTask.getStrStatus(task.status));
                            tasksQuery := Text.replace(tasksQuery, #text "[dueDate]", Int.toText(task.dueDate));
                            tasksQuery := Text.replace(tasksQuery, #text "[priority]", priority);

                            // Append to the final result string
                            tasksQueryList := tasksQueryList # tasksQuery # queryAssigness # "; ";
                            idx += 1;
                        };
                    };
                };

                return tasksQueryList;
            };
        };
    };

    // MARK: Save multiple tasks from llm

    public func saveLlmTasks(
        caller    : Principal,
        projectId : Nat,
        reqTasks  : [TypTask.TaskRequest],
    ) : async Result.Result<[Text], Text> {
        if (not task.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };

        var taskSummary : [Text] = [];
        for(req in reqTasks.vals()) {
            // Update appropriate project id
            let updatedTask = { req with projectId = projectId; };
            let result = task.createTask(caller, updatedTask);
            let summary : Text = 
                "Title: " # result.title # ", " #
                "Desc: " # result.desc # ", " #
                "Due: " # Int.toText(result.dueDate);

            taskSummary := Array.append(taskSummary, [summary]);
        };

        return #ok(taskSummary);
    };
}