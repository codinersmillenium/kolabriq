import Iter "mo:base/Iter";
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
import TypUser "../user/type";

import UtlDate "../utils/date";
import Utl "../utils/helper";

module {
    private type TaskHashKey       = Blob;
    private type ReviewHashKey     = Blob;
    private type ProjectHashKey    = Blob;

    public type StableTasks        = (TaskHashKey, TypTask.Task);
    public type StableProjectTasks = (ProjectHashKey, [TypCommon.TaskId]);
    public type StableMemberTasks  = (TypCommon.UserId, [TypCommon.TaskId]);
    public type StableReviews      = (ReviewHashKey, TypTask.TaskReview);
    public type StableTaskReview   = (TaskHashKey, TypCommon.TaskReviewId);
    
    public class Task(
        taskId           : TypCommon.TaskId,
        reviewId         : TypCommon.TaskReviewId,
        dataTasks        : [StableTasks],
        dataProjectTasks : [StableProjectTasks],
        dataMemberTasks  : [StableMemberTasks],
        dataReviews      : [StableReviews],
        dataTaskReview   : [StableTaskReview],
    ) {
        public var nextTasksId  = taskId;
        public var nextReviewId = reviewId;
        public let tasks        = HashMap.HashMap<TaskHashKey, TypTask.Task>(dataTasks.size(), Blob.equal, Blob.hash);
        public let projectTasks = HashMap.HashMap<ProjectHashKey, [TypCommon.TaskId]>(dataProjectTasks.size(), Blob.equal, Blob.hash);
        public let memberTasks  = HashMap.HashMap<TypCommon.UserId, [TypCommon.TaskId]>(dataMemberTasks.size(), Principal.equal, Principal.hash);
        public let reviews      = HashMap.HashMap<ReviewHashKey, TypTask.TaskReview>(dataReviews.size(), Blob.equal, Blob.hash);
        public let taskReview   = HashMap.HashMap<ProjectHashKey, TypCommon.TaskReviewId>(dataTaskReview.size(), Blob.equal, Blob.hash);

        // MARK: Task primary id
        public func getTaskPrimaryId() : Nat {
            let tasksId = nextTasksId;
            nextTasksId += 1;
            return tasksId;
        };

        // MARK: Review primary id
        public func getReviewPrimaryId() : Nat {
            let tasksId = nextReviewId;
            nextReviewId += 1;
            return tasksId;
        };

        // MARK: Get task by id
        public func getTasksByIds(ids: [TypCommon.TaskId]) : [TypTask.Task] {
            let data = Buffer.Buffer<TypTask.Task>(ids.size());
            for (id in ids.vals()) {
                switch (findById(id)) {
                    case (?t) data.add(t);
                    case (null) {};
                }
            };
            return Buffer.toArray(data);
        };

        // MARK: Filter task
        public func getFilteredTasks(
            projectId : TypCommon.ProjectId,
            filter    : TypTask.TaskFilter,
        ) : [TypTask.Task] {
            switch(projectTasks.get(Utl.natToBlob(projectId))) {
                case(null) { return [] };
                case(?tasksId) {
                    let filteredTask = Iter.filter<TypTask.Task>(
                        getTasksByIds(tasksId).vals(), 
                        func (task : TypTask.Task) : Bool {
                            Text.contains(task.title, #text(filter.keyword)) or
                            Text.contains(task.description, #text(filter.keyword)) or
                            Array.find<TypTask.TaskStatus>(filter.status, func(s) = s == task.status) != null or
                            Array.find<TypCommon.Tags>(filter.taskTag, func(t) = t == task.taskTag) != null
                    });

                    return Buffer.toArray<TypTask.Task>(Buffer.fromIter<TypTask.Task>(filteredTask));
                };
            };
        };

        // MARK: Get user tasks based on project id
        public func getUserTasksBasedOnProjectId(
            userId    : TypCommon.UserId,
            projectId : TypCommon.ProjectId,
        ) : [TypTask.Task] {
            switch(projectTasks.get(Utl.natToBlob(projectId))) {
                case(null)              { return [] };
                case(?tasksIdByProject) {
                    switch(memberTasks.get(userId)) {
                        case(null)           { return [] };
                        case(?tasksIdByUser) {
                            let filteredUserProjectTask = Array.filter<TypCommon.TaskId>(
                                tasksIdByUser,
                                func (tUser) {
                                    Array.find<TypCommon.TaskId>(
                                        tasksIdByProject, 
                                        func tProject = tProject == tUser,
                                    ) != null
                                }
                            );
                            return getTasksByIds(filteredUserProjectTask);
                        };
                    };
                };
            };
        };

        // MARK: Create task
        public func createTask(
            owner : TypCommon.UserId, 
            req : TypTask.TaskRequest
        ) : TypTask.Task {
            let data : TypTask.Task = {
                id          = getTaskPrimaryId();
                projectId   = req.projectId;
                title       = req.title;
                description = req.description;
                taskTag     = req.taskTag;
                status      = #todo;
                dueDate     = req.dueDate;
                priority    = false;
                assignees   = req.assignees;
                doneAt      = null;
                doneById    = null;
                createdAt   = UtlDate.now();
                createdById = owner;
                updatedAt   = null;
                updatedById = null;
            };

            tasks.put(Utl.natToBlob(data.id), data);

            let encodedProjectId = Utl.natToBlob(data.projectId);
            projectTasks.put(
                encodedProjectId,
                switch(projectTasks.get(encodedProjectId)) {
                    case (null)     { [data.id]; };
                    case (?tasksId) { Array.append<TypCommon.TaskId>(tasksId, [data.id]); };
                }
            );

            for(userId in req.assignees.vals()) {
                memberTasks.put(
                    userId,
                    switch(memberTasks.get(userId)) {
                        case (null)     { [data.id]; };
                        case (?tasksId) { Array.append<Nat>(tasksId, [data.id]); };
                    }
                );
            };


            return data;
        };

        // MARK: Find by id
        public func findById(idTask : TypCommon.TaskId) : ?TypTask.Task {
            return switch (tasks.get(Utl.natToBlob(idTask))) {
                case (null)  { return null; };
                case (?task) {
                    let data : TypTask.Task = {
                        id          = task.id;
                        projectId   = task.projectId;
                        title       = task.title;
                        description = task.description;
                        taskTag     = task.taskTag;
                        status      = task.status;
                        dueDate     = task.dueDate;
                        priority    = task.priority;
                        assignees   = task.assignees;
                        doneAt      = task.doneAt;
                        doneById    = task.doneById;
                        createdAt   = task.createdAt;
                        createdById = task.createdById;
                        updatedAt   = task.updatedAt;
                        updatedById = task.updatedById;
                    };
                    return ?data;
                };
            };
        };

        // MARK: Update status
        public func updateStatus(
            userId    : TypCommon.UserId, 
            task      : TypTask.Task, 
            reqStatus : TypTask.TaskStatus,
        ) : TypTask.Task {
            let doneTimestamp : ?Int = if (reqStatus == #done) {
                ?UtlDate.now();
            } else {
                task.doneAt;
            };

            let data : TypTask.Task = {
                id          = task.id;
                projectId   = task.projectId;
                title       = task.title;
                description = task.description;
                taskTag     = task.taskTag;
                status      = reqStatus;
                dueDate     = task.dueDate;
                priority    = false;
                assignees   = task.assignees;
                doneAt      = doneTimestamp;
                doneById    = ?userId;
                createdAt   = task.createdAt;
                createdById = task.createdById;
                updatedAt   = ?UtlDate.now();
                updatedById = ?userId;
            };

            tasks.put(Utl.natToBlob(data.id), data);

            // Update review if exists
            switch(taskReview.get(Utl.natToBlob(data.id))) {
                case(null)      {};
                case(?reviewId) {
                    switch(reviews.get(Utl.natToBlob(reviewId))) {
                        case(null)    {};
                        case(?review) {
                            if (task.status == #done) {
                                saveReview(
                                    userId,
                                    {
                                        taskId = data.id;
                                        review = review.review;
                                    },
                                    true
                                )
                            }
                        };
                    };
                };
            };

            return data;
        };

        // MARK: Check task are complete
        public func isTasksAreCompleted(tasks : [TypTask.Task]) : Bool {
            return not (Array.find<TypTask.Task>(tasks, func t = t.status != #done ) != null);
        };

        // MARK: Assign user
        public func assignUser(
            userId         : TypCommon.UserId,
            task           : TypTask.Task, 
            assignedUserId : TypCommon.UserId,
        ) : Bool {
            let newUser : [TypCommon.UserId] = Array.append<TypCommon.UserId>(
                task.assignees, [assignedUserId]
            );

            let data : TypTask.Task = {
                id          = task.id;
                projectId   = task.projectId;
                title       = task.title;
                description = task.description;
                taskTag     = task.taskTag;
                status      = task.status;
                dueDate     = task.dueDate;
                priority    = task.priority;
                assignees   = newUser;
                doneAt      = task.doneAt;
                doneById    = task.doneById;
                createdAt   = task.createdAt;
                createdById = task.createdById;
                updatedAt   = ?UtlDate.now();
                updatedById = ?userId;
            };

            tasks.put(Utl.natToBlob(data.id), data);

            return true;
        };

        // MARK: Response mapper
        public func mappedToResponse(
            task  : TypTask.Task,
            users : [TypUser.UserResponse],
        ) : TypTask.TaskResponse {
            let review = switch(taskReview.get(Utl.natToBlob(task.id))) {
                case(null) { null };
                case(?reviewId) {
                    switch(reviews.get(Utl.natToBlob(reviewId))) {
                        case(null)   { null };
                        case(review) { review; };
                    };
                };
            };

            let result : TypTask.TaskResponse = {
                id          = task.id;
                projectId   = task.projectId;
                title       = task.title;
                description = task.description;
                taskTag     = task.taskTag;
                status      = task.status;
                dueDate     = task.dueDate;
                priority    = task.priority;
                isOverdue   = task.dueDate < UtlDate.now();
                assignees   = users;
                doneAt      = task.doneAt;
                review      = review;
            };

            return result;
        };

        // MARK: Get user overview
        public func userOverview(
            projectId : TypCommon.ProjectId,
        ) : ([TypTask.UserOverview], TypTask.OverviewError) {
            switch(projectTasks.get(Utl.natToBlob(projectId))) {
                case(null)     { return ([], #notFound) };
                case(?tasksId) {
                    let dataTask      = getTasksByIds(tasksId);
                    let dumpPrincipal = Principal.fromText("un4fu-tqaaa-aaaab-qadjq-cai");
                    let overviewMap   = HashMap.HashMap<
                        TypCommon.UserId, 
                        TypTask.UserOverview
                    >(0, Principal.equal, Principal.hash);

                    if (not isTasksAreCompleted(dataTask)) return ([], #notDone);

                    label loopTask for(task in dataTask.vals()) {
                        if (task.status != #done) continue loopTask;

                        let userId       = Option.get(task.doneById, dumpPrincipal);
                        let doneAt       = Option.get(task.doneAt, UtlDate.now());
                        let userAssigned = Buffer.forSome<TypCommon.UserId>(
                            Buffer.fromArray(task.assignees), 
                            func uId = uId == userId
                        );

                        let isOverdue      = doneAt < task.dueDate;
                        let completingTime = doneAt - task.dueDate;

                        switch(overviewMap.get(userId)) {
                            case(null) {
                                let data : TypTask.UserOverview = {
                                    userId            = userId;
                                    totalTask         = if (userAssigned) 1 else 0;
                                    totalDone         = 1;
                                    totalOverdue      = if (isOverdue) 1 else 0;
                                    avgCompletingTime = completingTime;
                                };

                                overviewMap.put(data.userId, data);
                            };
                            case(?overview) {
                                let data : TypTask.UserOverview = {
                                    userId            = overview.userId;
                                    totalTask         = overview.totalTask + (if (userAssigned) 1 else 0);
                                    totalDone         = overview.totalDone + 1;
                                    totalOverdue      = overview.totalOverdue + (if (isOverdue) 1 else 0);
                                    avgCompletingTime = overview.avgCompletingTime + (completingTime);
                                };

                                overviewMap.put(data.userId, data);
                            };
                        };
                    };

                    let result = Buffer.Buffer<TypTask.UserOverview>(0);
                    for(overview in overviewMap.vals()) {
                        let averageCompletingTime          = overview.avgCompletingTime / overview.totalDone;
                        let newData : TypTask.UserOverview = {
                            userId            = overview.userId;
                            totalTask         = overview.totalTask;
                            totalDone         = overview.totalDone;
                            totalOverdue      = overview.totalOverdue;
                            avgCompletingTime = averageCompletingTime;
                        };

                        result.add(newData);
                    };

                    return (Buffer.toArray(result), #found);
                };
            };
        };

        // MARK: Get user overview
        public func saveReview(
            userId  : TypCommon.UserId,
            req     : TypTask.TaskReviewRequest,
            isFixed : Bool,
        ) {
            switch(taskReview.get(Utl.natToBlob(req.taskId))) {
                case(null) {
                    let data : TypTask.TaskReview = {
                        id          = getReviewPrimaryId();
                        taskId      = req.taskId;
                        review      = req.review;
                        fixedAt     = null;
                        fixedById   = null;
                        createdAt   = UtlDate.now();
                        createdById = userId;
                        updatedAt   = null;
                        updatedById = null;
                    };

                    reviews.put(Utl.natToBlob(data.taskId), data);
                    taskReview.put(Utl.natToBlob(data.taskId), data.id);
                };
                case(?reviewId) {
                    switch(reviews.get(Utl.natToBlob(reviewId))) {
                        case(null) {};
                        case(?review) {
                            let fixedAt   : ?Int               = if (isFixed) ?UtlDate.now() else null;
                            let fixedById : ?TypCommon.UserId  = if (isFixed) ?userId else null;
                            let data      : TypTask.TaskReview = {
                                id          = review.id;
                                taskId      = review.taskId;
                                review      = req.review;
                                fixedAt     = fixedAt;
                                fixedById   = fixedById;
                                createdAt   = review.createdAt;
                                createdById = review.createdById;
                                updatedAt   = ?UtlDate.now();
                                updatedById = ?userId;
                            };

                            reviews.put(Utl.natToBlob(data.taskId), data);
                            taskReview.put(Utl.natToBlob(data.taskId), data.id);
                        };
                    };
                };
            };
        };
    }
}