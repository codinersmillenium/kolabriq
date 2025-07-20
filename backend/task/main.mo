import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";

import TypCommon "../common/type";
import TypUser "../user/type";
import TypTask "type";

import SvcTask "service";

import UtlTask "util";
import Utl "../utils/helper";

import CanUser "canister:user";

actor {
    private stable var nextTaskId   : TypCommon.TaskId       = 0;
    private stable var nextReviewId : TypCommon.TaskReviewId = 0;

    private stable var stableTasks        : [SvcTask.StableTasks]        = [];
    private stable var stableProjectTasks : [SvcTask.StableProjectTasks] = [];
    private stable var stableMemberTasks  : [SvcTask.StableMemberTasks]  = [];
    private stable var stableReviews      : [SvcTask.StableReviews]      = [];
    private stable var stableTaskReview   : [SvcTask.StableTaskReview]   = [];

    private let task = SvcTask.Task(
        nextTaskId,
        nextReviewId,
        stableTasks, 
        stableProjectTasks, 
        stableMemberTasks,
        stableReviews,
        stableTaskReview,
    );

    // MARK: Mapped arr to response
    private func mappedArrToResponse(arrTasks: [TypTask.Task]) : async [TypTask.TaskResponse] {
        let size = arrTasks.size();
        let data = Array.init<TypTask.TaskResponse>(
            size, 
            task.mappedToResponse(arrTasks[0], [])
        );
        
        for (i in Iter.range(0, size - 1)) {
            let currtask = arrTasks[i];
            let users    = await CanUser.getUsersByIds(currtask.assignees);
            switch(users) {
                case(#ok(dataUsers)) { data[i] := task.mappedToResponse(currtask, dataUsers); };
                case(_) {};
            };
        };

        return Array.freeze(data);
    };

    // MARK: Get filtered tasks
    public func getFilteredTasks(
        projectId : TypCommon.ProjectId,
        filter    : TypTask.TaskFilter,
    ) : async Result.Result<[TypTask.TaskResponse], ()> {
        let arrTasks = task.getFilteredTasks(projectId, filter);
        let result   = await mappedArrToResponse(arrTasks);

        return #ok(result);
	};

    // MARK: Get project tasks
    public shared func getProjectTasks(
        projectId : TypCommon.ProjectId,
    ) : async Result.Result<[TypTask.TaskResponse], ()>  {
        switch (task.projectTasks.get(Utl.natToBlob(projectId))) {
            case (null)     { return #ok([]) };
            case (?taskIds) {
                let arrTasks = task.getTasksByIds(taskIds);
                let result   = await mappedArrToResponse(arrTasks);

                return #ok(result);
            };
        };
    };

    // MARK: Get task assignees
    public shared func getTaskAssignees(
        projectId : TypCommon.ProjectId
    ) : async Result.Result<[TypUser.UserResponse], ()>  {
        switch (task.projectTasks.get(Utl.natToBlob(projectId))) {
            case (null)     { return #ok([]) };
            case (?taskIds) {
                let arrTasks = task.getTasksByIds(taskIds);
                let userIds = Buffer.Buffer<TypCommon.UserId>(0);
                for(task in arrTasks.vals()) {
                    for(assignedUserId in task.assignees.vals()) {
                        let hasBeenAdded = Buffer.forSome<TypCommon.UserId>(
                            userIds, 
                            func userId { userId == assignedUserId }
                        );

                        if (not hasBeenAdded) userIds.add(assignedUserId);
                    };
                };

                return await CanUser.getUsersByIds(Buffer.toArray(userIds));
            };
        };
    };

    // MARK: Get total project tasks
    public query func getTotalTasksProject(projectId : TypCommon.ProjectId) : async Nat  {
        switch (task.projectTasks.get(Utl.natToBlob(projectId))) {
            case (null)     { return 0 };
            case (?taskIds) { return taskIds.size() };
        };
    };

    // MARK: Create task
    public shared ({caller}) func createTask(
        req : TypTask.TaskRequest,
    ) : async Result.Result<TypTask.TaskResponse, Text> {
        let result = task.createTask(caller, req);
        return #ok(task.mappedToResponse(result, []));
	};

    // MARK: Update status
    public shared ({caller}) func updateStatus(
        taskId    : TypCommon.TaskId,
        reqStatus : TypTask.TaskStatus,
    ) : async Result.Result<TypTask.TaskResponse, Text> {
        switch(task.findById(taskId)) {
            case(null)  { return #err("Task tidak ditemukan"); };
            case(?t) {
                ignore task.updateStatus(caller, t, reqStatus);
                let users = await CanUser.getUsersByIds(t.assignees);
                return switch(users) {
                    case(#ok(dataUsers)) { return #ok(task.mappedToResponse(t, dataUsers)); };
                    case(_)              { return #ok(task.mappedToResponse(t, [])); };
                };
            };
        };
	};

    // MARK: Update status
    public query func isAllTaskAreComplete(projectId : TypCommon.ProjectId) : async Bool {
        switch(task.projectTasks.get(Utl.natToBlob(projectId))) {
            case(null)     { return false };
            case(?tasksId) { return task.isTasksAreCompleted(task.getTasksByIds(tasksId)) };
        };
	};

    // MARK: Assign responsible user
    // TODO: ASSING USER BISA BANYAK JADI NTI DI LOOP
    public shared ({caller}) func assignResponsibleUser(
        taskId       : TypCommon.TaskId, 
        assignUserId : TypCommon.UserId,
    ) : async Result.Result<Text, Text> {
        switch(task.findById(taskId)) {
            case(null)  { return #err("Task tidak ditemukan"); };
            case(?t) {
                let isUserAssigned = task.assignUser(caller, t, assignUserId);
                return switch(isUserAssigned) {
                    case(false) { return #err("Terjadi kesalahan, mohon coba beberapa waktu lagi") };
                    case(true)  { return #ok("Berhasil perbarui data") };
                };
            };
        };
    };

    // MARK: Get user overview
    public query func getUserOverview(
        projectId : TypCommon.ProjectId, 
    ) : async Result.Result<[TypTask.UserOverview], Text> {
        let (result, error) = task.userOverview(projectId);
        if (error != #found) return #err(UtlTask.translateOverviewError(error));
        return #ok(result);
    };

    // MARK: Set review
    public shared ({caller}) func setReview(req : TypTask.TaskReviewRequest) : async Result.Result<Text, ()> {
        task.saveReview(caller, req, false);
        return #ok("Berhasil menambahkan review");
    };

    // MARK: System

    system func preupgrade() {
        stableTasks        := Iter.toArray(task.tasks.entries());
        stableProjectTasks := Iter.toArray(task.projectTasks.entries());
        stableMemberTasks  := Iter.toArray(task.memberTasks.entries());
    };

    system func postupgrade() {
        stableTasks        := [];
        stableProjectTasks := [];
        stableMemberTasks  := [];
    };
}