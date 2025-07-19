import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Principal "mo:base/Principal";

import TypCommon "../common/type";
import TypTask "type";
import TypUser "../user/type";

import UtlDate "../utils/date";
import Utl "../utils/helper";

module {
    private type TaskHashKey       = Blob;
    private type ProjectHashKey    = Blob;
    public type StableTasks        = (TaskHashKey, TypTask.Task);
    public type StableProjectTasks = (ProjectHashKey, [TypCommon.TaskId]);
    public type StableMemberTasks  = (TypCommon.UserId, [TypCommon.TaskId]);
    
    public class Tasks(
        taskId           : TypCommon.TaskId,
        dataTasks        : [StableTasks],
        dataProjectTasks : [StableProjectTasks],
        dataMemberTasks  : [StableMemberTasks],
    ) {
        public var nextTasksId  = taskId;
        public let tasks        = HashMap.HashMap<TaskHashKey, TypTask.Task>(dataTasks.size(), Blob.equal, Blob.hash);
        public let projectTasks = HashMap.HashMap<ProjectHashKey, [TypCommon.TaskId]>(dataProjectTasks.size(), Blob.equal, Blob.hash);
        public let memberTasks  = HashMap.HashMap<TypCommon.UserId, [TypCommon.TaskId]>(dataMemberTasks.size(), Principal.equal, Principal.hash);

        public func getNextTasksId() : Nat {
            let tasksId = nextTasksId;
            nextTasksId += 1;
            return tasksId;
        };

        public func getFilteredTasks(filter : TypTask.TaskFilter) : [TypTask.Task] {
            let filterTask = Iter.filter<TypTask.Task>(
                tasks.vals(), 
                func (task : TypTask.Task) : Bool {
                    Text.contains(task.title, #text(filter.keyword)) or
                    Text.contains(task.description, #text(filter.keyword)) or
                    Array.find<TypTask.TaskStatus>(filter.status, func(s) = s == task.status) != null or
                    Array.find<TypCommon.Tags>(filter.taskTag, func(t) = t == task.taskTag) != null
            });

            return Buffer.toArray<TypTask.Task>(Buffer.fromIter<TypTask.Task>(filterTask));
        };

        public func getTasksByIds(ids: [TypCommon.TaskId]) : [TypTask.Task] {
            let data = Buffer.Buffer<TypTask.Task>(0);
            for (id in ids.vals()) {
                switch (findById(id)) {
                    case (?t) data.add(t);
                    case (null) {};
                }
            };
            return Buffer.toArray(data);
        };

        public func createTask(owner : TypCommon.UserId, req : TypTask.TaskRequest) : TypTask.Task {
            let data : TypTask.Task = {
                id          = getNextTasksId();
                idProject   = req.idProject;
                title       = req.title;
                description = req.description;
                taskTag     = req.taskTag;
                status      = #todo;
                dueDate     = req.dueDate;
                priority    = false;
                assignees   = req.assignees;
                doneAt      = null;
                createdAt   = UtlDate.now();
                createdById = owner;
                updatedAt   = null;
                updatedById = null;
            };

            putTask(data);

            let encodedIdProject = Utl.natToBlob(data.idProject);
            projectTasks.put(
                encodedIdProject,
                switch(projectTasks.get(encodedIdProject)) {
                    case (null) { [data.id]; };
                    case (?tasksId) { Array.append<Nat>(tasksId, [data.id]); };
                }
            );

            for(idUser in req.assignees.vals()) {
                memberTasks.put(
                    idUser,
                    switch(memberTasks.get(idUser)) {
                        case (null) { [data.id]; };
                        case (?tasksId) { Array.append<Nat>(tasksId, [data.id]); };
                    }
                );
            };


            return data;
        };

        public func putTask(task : TypTask.Task) {
            tasks.put(Utl.natToBlob(task.id), task);
        };

        public func findById(taskId : TypCommon.TaskId) : ?TypTask.Task {
            return switch (tasks.get(Utl.natToBlob(taskId))) {
                case (null)  { return null; };
                case (?task) {
                    let data : TypTask.Task = {
                        id          = task.id;
                        idProject   = task.idProject;
                        title       = task.title;
                        description = task.description;
                        taskTag     = task.taskTag;
                        status      = task.status;
                        dueDate     = task.dueDate;
                        priority    = task.priority;
                        assignees   = task.assignees;
                        doneAt      = task.doneAt;
                        createdAt   = task.createdAt;
                        createdById = task.createdById;
                        updatedAt   = task.updatedAt;
                        updatedById = task.updatedById;
                    };
                    return ?data;
                };
            };
        };

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
                idProject   = task.idProject;
                title       = task.title;
                description = task.description;
                taskTag     = task.taskTag;
                status      = reqStatus;
                dueDate     = task.dueDate;
                priority    = false;
                assignees   = task.assignees;
                doneAt      = doneTimestamp;
                createdAt   = task.createdAt;
                createdById = task.createdById;
                updatedAt   = ?UtlDate.now();
                updatedById = ?userId;
            };

            putTask(data);

            return data;
        };

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
                idProject   = task.idProject;
                title       = task.title;
                description = task.description;
                taskTag     = task.taskTag;
                status      = task.status;
                dueDate     = task.dueDate;
                priority    = task.priority;
                assignees   = newUser;
                doneAt      = task.doneAt;
                createdAt   = task.createdAt;
                createdById = task.createdById;
                updatedAt   = ?UtlDate.now();
                updatedById = ?userId;
            };

            putTask(data);

            return true;
        };

        public func mappedToResponse(
            task  : TypTask.Task,
            users : [TypUser.UserResponse],
        ) : TypTask.TaskResponse {
            let data : TypTask.TaskResponse = {
                id          = task.id;
                idProject   = task.idProject;
                title       = task.title;
                description = task.description;
                taskTag     = task.taskTag;
                status      = task.status;
                dueDate     = task.dueDate;
                priority    = task.priority;
                isOverdue   = task.dueDate < UtlDate.now();
                assignees   = users;
                doneAt      = task.doneAt;
            };

            return data;
        };
    }
}