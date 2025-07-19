import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Principal "mo:base/Principal";

import TypCommon "../common/type";
import TypUser "../user/type";
import TypTask "type";

import SvcTask "service";

import Utl "../utils/helper";

import CanUser "canister:user";

actor {
    private stable var nextTaskId         : TypCommon.TaskId             = 0;
    private stable var stableTasks        : [SvcTask.StableTasks]        = [];
    private stable var stableProjectTasks : [SvcTask.StableProjectTasks] = [];
    private stable var stableMemberTasks  : [SvcTask.StableMemberTasks]  = [];

    private let tasks = SvcTask.Tasks(
        nextTaskId, 
        stableTasks, 
        stableProjectTasks, 
        stableMemberTasks,
    );

// Last here
    private func mappedArrToResponse(arrTasks: [TypTask.Task]) : async [TypTask.TaskResponse] {
        let size = arrTasks.size();
        let data = Array.init<TypTask.TaskResponse>(
            size, 
            tasks.mappedToResponse(arrTasks[0], [])
        );
        
        for (i in Iter.range(0, size - 1)) {
            let task  = arrTasks[i];
            let users = await CanUser.getUsersByIds(task.assignees);
            switch(users) {
                case(#ok(dataUsers: [TypUser.UserResponse])) { data[i] := tasks.mappedToResponse(task, dataUsers); };
                case(_) {};
            };
        };

        return Array.freeze(data);
    };

    public func getFilteredTasks(
        filter : TypTask.TaskFilter
    ) : async Result.Result<[TypTask.TaskResponse], ()> {
        let arrTasks = tasks.getFilteredTasks(filter);
        let result   = await mappedArrToResponse(arrTasks);

        return #ok(result);
	};

    public func getTasksBaseProjectId(
        idProject : TypCommon.ProjectId,
    ) : async Result.Result<[TypTask.TaskResponse], ()>  {
        switch (tasks.projectTasks.get(Utl.natToBlob(idProject))) {
            case (null)     { return #ok([]) };
            case (?taskIds) {
                let arrTasks = tasks.getTasksByIds(taskIds);
                let result   = await mappedArrToResponse(arrTasks);

                return #ok(result);
            };
        };
    };

    // public shared func getProjectMembers(
    //     idProject : TypCommon.ProjectId
    // ) : async Result.Result<[TypUser.UserResponse], ()>  {
    //     switch (tasks.projectTasks.get(Utl.natToBlob(idProject))) {
    //         case (null)     { return #ok([]) };
    //         case (?taskIds) {
    //             let arrTasks = tasks.getTasksByIds(taskIds);
    //             // filteredUser = filter user id loop arr task ambil task asigness, trus masukkin array tapi harus unique idnya

    //             let size = arrTasks.size();
    //             let data = Array.init<TypUser.UserResponse>(
    //                 size, 
    //                 {
    //                     id        = Principal.fromText("aaaaa-aa");
    //                     userName  = "";
    //                     firstName = "";
    //                     lastName  = "";
    //                     role      = #developer;
    //                     tags      = [];
    //                     createdAt = 0;
    //                 }
    //             );
                
    //             for (i in Iter.range(0, size - 1)) {
    //                 let users = await CanUser.getUsersByIds(filteredUser);
    //                 switch(users) {
    //                     case(#ok(dataUsers)) { data[i] := dataUsers; };
    //                     case(_) {};
    //                 };
    //             };

    //             return #ok(Array.freeze(data));
    //         };
    //     };
    // };

    public shared ({caller}) func getMemberTaskList() : async Result.Result<[TypTask.TaskResponse], ()>  {
        switch (tasks.memberTasks.get(caller)) {
            case (null)     { return #ok([]) };
            case (?taskIds) {
                let arrTasks = tasks.getTasksByIds(taskIds);
                let result   = await mappedArrToResponse(arrTasks);

                return #ok(result);
            };
        };
    };

    public shared ({caller}) func createTask(
        req : TypTask.TaskRequest,
    ) : async Result.Result<TypTask.TaskResponse, Text> {
        let task = tasks.createTask(caller, req);
        #ok(tasks.mappedToResponse(task, []));
	};

    public shared ({caller}) func updateStatus(
        taskId    : TypCommon.TaskId,
        reqStatus : TypTask.TaskStatus,
    ) : async Result.Result<TypTask.TaskResponse, Text> {
        let task = tasks.findById(taskId);
        switch(task) {
            case(null)  { return #err("Task tidak ditemukan"); };
            case(?task) {
                ignore tasks.updateStatus(caller, task, reqStatus);
                let users = await CanUser.getUsersByIds(task.assignees);
                return switch(users) {
                    case(#ok(dataUsers)) { #ok(tasks.mappedToResponse(task, dataUsers)); };
                    case(_) { #ok(tasks.mappedToResponse(task, [])); };
                };
            };
        };
	};

    public shared ({caller}) func assignResponsibleUser(
        taskId : TypCommon.TaskId, 
        userId : TypCommon.UserId,
    ) : async Result.Result<Text, Text> {
        let task = tasks.findById(taskId);
        switch(task) {
            case(null)  { return #err("Task tidak ditemukan"); };
            case(?task) {
                let isUserAssigned = tasks.assignUser(caller, task, userId);
                return switch(isUserAssigned) {
                    case(false) { #err("Terjadi kesalahan, mohon coba beberapa waktu lagi") };
                    case(true)  { #ok("Berhasil perbarui data") };
                };
            };
        };
    };

    system func preupgrade() {
        stableTasks        := Iter.toArray(tasks.tasks.entries());
        stableProjectTasks := Iter.toArray(tasks.projectTasks.entries());
        stableMemberTasks  := Iter.toArray(tasks.memberTasks.entries());
    };

    system func postupgrade() {
        stableTasks        := [];
        stableProjectTasks := [];
        stableMemberTasks  := [];
    };
}