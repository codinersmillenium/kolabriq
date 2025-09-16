import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Principal "mo:base/Principal";
import Option "mo:base/Option";

import TypCommon "../common/type";
import TypTask "type";

import UtlTask "util";
import UtlCommon "../common/util";
import UtlDate "../utils/date";
import Utl "../utils/helper";

module {
    private type BlockHashKey       = Blob;
    private type TaskHashKey        = Blob;
    private type ReviewHashKey      = Blob;
    private type ProjectTaskHashKey = Blob;

    public type StableBlockchain       = (BlockHashKey, TypTask.TaskBlock);
    public type StableTaskIndex        = (TaskHashKey, [BlockHashKey]);
    public type StableReviewIndex      = (ReviewHashKey, [BlockHashKey]);
    public type StableTaskReviewIndex  = (TaskHashKey, [TypCommon.ReviewId]);
    public type StableProjectTaskIndex = (ProjectTaskHashKey, [TypCommon.TaskId]);
    
    public class Task(
        blockId              : TypCommon.BlockId,
        taskId               : TypCommon.TaskId,
        reviewId             : TypCommon.ReviewId,
        dataBlockchain       : [StableBlockchain],
        dataTaskIndex        : [StableTaskIndex],
        dataReviewIndex      : [StableReviewIndex],
        dataTaskReviewIndex  : [StableTaskReviewIndex],
        dataProjectTaskIndex : [StableProjectTaskIndex],
    ) {
        public var blockCounter = blockId;
        public var nextTasksId  = taskId;
        public var nextReviewId = reviewId;

        public var blockchain       = HashMap.HashMap<BlockHashKey, TypTask.TaskBlock>(dataBlockchain.size(), Blob.equal, Blob.hash);
        public var taskIndex        = HashMap.HashMap<TaskHashKey, [BlockHashKey]>(dataTaskIndex.size(), Blob.equal, Blob.hash);
        public var reviewIndex      = HashMap.HashMap<ReviewHashKey, [BlockHashKey]>(dataReviewIndex.size(), Blob.equal, Blob.hash);
        public var taskReviewIndex  = HashMap.HashMap<TaskHashKey, [TypCommon.ReviewId]>(dataTaskReviewIndex.size(), Blob.equal, Blob.hash);
        public var projectTaskIndex = HashMap.HashMap<ProjectTaskHashKey, [TypCommon.TaskId]>(dataProjectTaskIndex.size(), Blob.equal, Blob.hash);

        // MARK: Blockchain handler

        private func getPreviousHash(): Text {
            if (blockCounter == 0) {
                return UtlCommon.GENESIS_HASH;
            } else {
                let prevBlockKey = Nat.sub(blockCounter, 1);
                switch (blockchain.get(Utl.natToBlob(prevBlockKey))) {
                    case (?block) { block.hash };
                    case (null)   { UtlCommon.GENESIS_HASH };
                }
            };
        };

        // MARK: Verify blockchain integrity

        public func verifyChainIntegrity(): Bool {
            if (blockCounter == 0) return true;
            
            var currentIndex = 1;
            while (currentIndex < blockCounter) {
                let prevBlockKey       = Nat.sub(currentIndex, 1);
                let (currIdx, prevIdx) = (Utl.natToBlob(currentIndex), Utl.natToBlob(prevBlockKey));

                switch (blockchain.get(currIdx), blockchain.get(prevIdx)) {
                    case (?currentBlock, ?previousBlock) {
                        if (currentBlock.previousHash != previousBlock.hash) return false;

                        let recalculatedHash = UtlTask.calculateHash(currentBlock);
                        if (currentBlock.hash != recalculatedHash) return false;
                    };
                    case (_, _) { return false; };
                };

                currentIndex += 1;
            };

            return true;
        };

        // MARK: Incremental id

        public func getTaskPrimaryId() : Nat {
            let tasksId = nextTasksId;
            nextTasksId += 1;
            return tasksId;
        };

        public func getReviewPrimaryId() : Nat {
            let tasksId = nextReviewId;
            nextReviewId += 1;
            return tasksId;
        };

        // MARK: Create task

        public func createTask(
            caller : TypCommon.UserId, 
            req    : TypTask.TaskRequest,
        ) : TypTask.Task {
            let taskData: TypTask.Task = {
                id          = getTaskPrimaryId();
                projectId   = req.projectId;
                title       = req.title;
                desc        = req.desc;
                tag         = req.tag;
                status      = #todo;
                priority    = false;
                assignees   = req.assignees;
                dueDate     = req.dueDate;
                doneAt      = null;
                doneById    = null;
                createdById = caller;
                action      = #create;
            };

            var newBlock: TypTask.TaskBlock = {
                id           = blockCounter;
                timestamp    = UtlDate.now();
                previousHash = getPreviousHash();
                data         = #task(taskData);
                hash         = "";
                signature    = Principal.toText(caller) # "_signature";
                nonce        = 0;
            };

            // Add to blockchain
            let blobBlockCounter = Utl.natToBlob(blockCounter);
            blockchain.put(blobBlockCounter, UtlTask.hashBlock(newBlock));
        
            // Update task index for quick lookups
            let blobTaskId = Utl.natToBlob(taskData.id);
            taskIndex.put(blobTaskId, [blobBlockCounter]);

            // Add project id to project-task index
            let blobProjectId = Utl.natToBlob(taskData.projectId);
            switch (projectTaskIndex.get(blobProjectId)) {
                case (null)      { projectTaskIndex.put(blobProjectId, [taskData.id]); };
                case (?projects) { projectTaskIndex.put(blobProjectId, Array.append(projects, [taskData.id])); };
            };

            blockCounter += 1;
            return taskData;
        };

        // MARK: Get curr task state

        public func getCurrentTaskState(taskId: TypCommon.TaskId): ?TypTask.Task {
            switch (taskIndex.get(Utl.natToBlob(taskId))) {
                case (null)      { return null; };
                case (?blockIds) {
                    if (blockIds.size() == 0) return null;

                    // Find the latest task data block
                    var i = blockIds.size();
                    while (i > 0) {
                        i -= 1;
                        switch (blockchain.get(blockIds[i])) {
                            case (null)   { };
                            case (?block) {
                                switch (block.data) {
                                    case (#task(data)) { return ?data; };
                                    case (_)           { }; // Skip non-project blocks
                                };
                            };
                        };
                    };

                    return null;
                };
            };
        };

        // MARK: Update metadata
        
        public func updateMetadata(
            caller : TypCommon.UserId, 
            task   : TypTask.Task,
            req    : TypTask.TaskRequest,
        ) : TypTask.Task {
            // Update specific field
            let updatedState = if (task.title != req.title) {{ 
                task with 
                title  = req.title;
                action = #metadataUpdate({
                    field    = "title";
                    oldValue = task.title;
                    newValue = req.title;
                });
            }} else if (task.desc != req.desc) {{ 
                task with 
                desc   = req.desc;
                action = #metadataUpdate({
                    field    = "desc";
                    oldValue = task.desc;
                    newValue = req.desc;
                });
            }} else if (task.tag != req.tag) {{ 
                task with 
                tag    = req.tag;
                action = #metadataUpdate({
                    field    = "tag";
                    oldValue = UtlCommon.getStrTag(task.tag);
                    newValue = UtlCommon.getStrTag(req.tag);
                });
            }} else {
                task
            };

            var newBlock: TypTask.TaskBlock = {
                id           = blockCounter;
                timestamp    = UtlDate.now();
                previousHash = getPreviousHash();
                data         = #task(updatedState);
                hash         = "";
                signature    = Principal.toText(caller) # "_signature";
                nonce        = 0;
            };

            // Add to blockchain
            let blobBlockCounter = Utl.natToBlob(blockCounter);
            blockchain.put(blobBlockCounter, UtlTask.hashBlock(newBlock));
        
            // Update task index for quick lookups
            let blobTaskId = Utl.natToBlob(updatedState.id);
            switch (taskIndex.get(blobTaskId)) {
                case (null)    { };
                case (?blocks) { taskIndex.put(blobTaskId, Array.append(blocks, [blobBlockCounter])); };
            };

            blockCounter += 1;
            return updatedState;
        };

        // MARK: Update status
        
        public func updateStatus(
            caller    : TypCommon.UserId, 
            task      : TypTask.Task,
            reqStatus : TypTask.TaskStatus,
        ) : TypTask.Task {
            let (doneAt, doneById) = if (reqStatus == #done) {
                (?UtlDate.now(), ?caller);
            } else if (reqStatus != #done and task.status == #done) {
                // Task was undone, clear completion data
                (null, null);
            } else {
                (task.doneAt, task.doneById);
            };

            let taskData: TypTask.Task = {
                task with
                status   = reqStatus;
                doneAt   = doneAt;
                doneById = doneById;
                action   = #statusUpdate({
                    from = task.status;
                    to   = reqStatus;
                });
            };

            var newBlock: TypTask.TaskBlock = {
                id           = blockCounter;
                timestamp    = UtlDate.now();
                previousHash = getPreviousHash();
                data         = #task(taskData);
                hash         = "";
                signature    = Principal.toText(caller) # "_signature";
                nonce        = 0;
            };

            // Add to blockchain
            let blobBlockCounter = Utl.natToBlob(blockCounter);
            blockchain.put(blobBlockCounter, UtlTask.hashBlock(newBlock));
        
            // Update task index for quick lookups
            let blobTaskId = Utl.natToBlob(taskData.id);
            switch (taskIndex.get(blobTaskId)) {
                case (null)    { };
                case (?blocks) { taskIndex.put(blobTaskId, Array.append(blocks, [blobBlockCounter])); };
            };

            blockCounter += 1;
            return taskData;
        };

        // MARK: Add review

        public func addReview(
            caller : TypCommon.UserId, 
            req    : TypTask.TaskReviewRequest,
        ) : TypTask.Review {
            let reviewData: TypTask.Review = {
                id         = getReviewPrimaryId();
                taskId     = req.taskId;
                review     = req.review;
                reviewerId = caller;
                fixedAt    = null;
                fixedById  = null;
                action     = #create;
            };

            var newBlock: TypTask.TaskBlock = {
                id           = blockCounter;
                timestamp    = UtlDate.now();
                previousHash = getPreviousHash();
                data         = #review(reviewData);
                hash         = "";
                signature    = Principal.toText(caller) # "_signature";
                nonce        = 0;
            };

            // Add to blockchain
            let blobBlockCounter = Utl.natToBlob(blockCounter);
            blockchain.put(blobBlockCounter, UtlTask.hashBlock(newBlock));
        
            // Update review index for quick lookups
            let blobReviewId = Utl.natToBlob(reviewData.id);
            reviewIndex.put(blobReviewId, [blobBlockCounter]);
      
            // Update task-review relationship
            let blobTaskId = Utl.natToBlob(req.taskId);
            switch (taskReviewIndex.get(blobTaskId)) {
                case (null)     { taskReviewIndex.put(blobTaskId, [reviewData.id]); };
                case (?reviews) { taskReviewIndex.put(blobTaskId, Array.append(reviews, [reviewData.id])); };
            };

            // Also add to task index to link review with task
            switch (taskIndex.get(blobTaskId)) {
                case (?blocks) { taskIndex.put(blobTaskId, Array.append(blocks, [blobBlockCounter])); };
                case (null)    { };
            };

            blockCounter += 1;
            return reviewData;
        };

        // MARK: Get curr review state

        public func getCurrentReviewState(reviewId: TypCommon.ReviewId): ?TypTask.Review {
            switch (reviewIndex.get(Utl.natToBlob(reviewId))) {
                case (null)      { return null; };
                case (?blockIds) {
                    if (blockIds.size() == 0) return null;

                    // Find the latest review data block
                    var i = blockIds.size();
                    while (i > 0) {
                        i -= 1;
                        switch (blockchain.get(blockIds[i])) {
                            case (null)   { };
                            case (?block) {
                                switch (block.data) {
                                    case (#review(data)) { return ?data; };
                                    case (_)           { }; // Skip non-project blocks
                                };
                            };
                        };
                    };

                    return null;
                };
            };
        };

        // MARK: Update review

        public func updateReview(
            caller : TypCommon.UserId,
            review : TypTask.Review,
            req    : TypTask.TaskReviewRequest,
        ) : TypTask.Review {
            let reviewData: TypTask.Review = {
                review with
                taskId = req.taskId;
                review = req.review;
                action = #update({
                    oldReview = review.review;
                    newReview = req.review;
                });
            };

            var newBlock: TypTask.TaskBlock = {
                id           = blockCounter;
                timestamp    = UtlDate.now();
                previousHash = getPreviousHash();
                data         = #review(reviewData);
                hash         = "";
                signature    = Principal.toText(caller) # "_signature";
                nonce        = 0;
            };

            // Add to blockchain
            let blobBlockCounter = Utl.natToBlob(blockCounter);
            blockchain.put(blobBlockCounter, UtlTask.hashBlock(newBlock));
        
            // Update review index
            let blobReviewId = Utl.natToBlob(reviewData.id);
            switch (reviewIndex.get(blobReviewId)) {
                case (null)    { };
                case (?blocks) { reviewIndex.put(blobReviewId, Array.append(blocks, [blobBlockCounter])); };
            };
      
            // Update task-review relationship
            let blobTaskId = Utl.natToBlob(req.taskId);
            switch (taskReviewIndex.get(blobTaskId)) {
                case (null) {};
                case (?_)   {
                    switch (taskIndex.get(blobTaskId)) {
                        case (null)    { };
                        case (?blocks) { taskIndex.put(blobTaskId, Array.append(blocks, [blobBlockCounter])); };
                    };
                };
            };

            blockCounter += 1;
            return reviewData;
        };

        // MARK: Update review fixed

        public func updateReviewFixed(
            caller : TypCommon.UserId,
            review : TypTask.Review,
        ) : TypTask.Review {
            let fixedReviewData: TypTask.Review = {
                review with
                fixedAt   = ?UtlDate.now();
                fixedById = ?caller;
                action    = #fix({ fixedBy = caller; });
            };

            var newBlock: TypTask.TaskBlock = {
                id           = blockCounter;
                timestamp    = UtlDate.now();
                previousHash = getPreviousHash();
                data         = #review(fixedReviewData);
                hash         = "";
                signature    = Principal.toText(caller) # "_signature";
                nonce        = 0;
            };

            // Add to blockchain
            let blobBlockCounter = Utl.natToBlob(blockCounter);
            blockchain.put(blobBlockCounter, UtlTask.hashBlock(newBlock));
        
            // Update review index
            let blobReviewId = Utl.natToBlob(fixedReviewData.id);
            switch (reviewIndex.get(blobReviewId)) {
                case (null)    { };
                case (?blocks) { reviewIndex.put(blobReviewId, Array.append(blocks, [blobBlockCounter])); };
            };
      
            // Update task-review relationship
            let blobTaskId = Utl.natToBlob(fixedReviewData.taskId);
            switch (taskIndex.get(blobTaskId)) {
                case (null)    { };
                case (?blocks) { taskIndex.put(blobTaskId, Array.append(blocks, [blobBlockCounter])); };
            };

            blockCounter += 1;
            return fixedReviewData;
        };

        // MARK: Get user overview

        public func userOverview(
            projectId : TypCommon.ProjectId,
        ) : ([TypTask.UserOverview], TypTask.OverviewError) {
            switch(projectTaskIndex.get(Utl.natToBlob(projectId))) {
                case(null)     { return ([], #not_found) };
                case(?taskIds) {
                    let dumpPrincipal = Principal.fromText("un4fu-tqaaa-aaaab-qadjq-cai");
                    let overviewMap   = HashMap.HashMap<
                        TypCommon.UserId, 
                        TypTask.UserOverview
                    >(0, Principal.equal, Principal.hash);

                    label loopTask for(taskId in taskIds.vals()) {
                        switch (getCurrentTaskState(taskId)) {
                            case (null)  {  };
                            case (?task) {
                                if (task.status != #done) continue loopTask;

                                // Get users who completed
                                let userId = Option.get(task.doneById, dumpPrincipal);
                                let doneAt = Option.get(task.doneAt, UtlDate.now());

                                // Check whether the task is completed past the due date
                                let isOverdue = doneAt > task.dueDate;

                                overviewMap.put(userId, switch(overviewMap.get(userId)) {
                                    case(null) {{
                                        userId       = userId;
                                        totalTask    = 1;
                                        totalDone    = 1;
                                        totalOverdue = if (isOverdue) 1 else 0;
                                    }};
                                    case(?overview) {{
                                        userId       = overview.userId;
                                        totalTask    = overview.totalTask + 1; // only the tasks he completes
                                        totalDone    = overview.totalDone + 1;
                                        totalOverdue = overview.totalOverdue + (if (isOverdue) 1 else 0);
                                    }};
                                });
                            };
                        };
                    };

                    if (overviewMap.size() == 0) return ([], #not_done);

                    let result = Buffer.Buffer<TypTask.UserOverview>(overviewMap.size());
                    for(overview in overviewMap.vals()) {
                        result.add({
                            userId       = overview.userId;
                            totalTask    = overview.totalTask;
                            totalDone    = overview.totalDone;
                            totalOverdue = overview.totalOverdue;
                        });
                    };

                    return (Buffer.toArray(result), #found);
                };
            };
        };
    }
}