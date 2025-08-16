import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";
import Blob "mo:base/Blob";

import TypCommon "../common/type";
import TypUser "../user/type";
import TypTask "../task/type";
import TypProject "type";

import UtlDate "../utils/date";
import Utl "../utils/helper";


module {
    private type ProjectHashKey         = Blob;
    private type ProjectTimeLineHashKey = Blob;

    public type StableProjects         = (ProjectHashKey, TypProject.Project);
    public type StableProjectBalances  = (ProjectHashKey, Nat);
    public type StableUserProjects     = (TypCommon.UserId, [TypCommon.ProjectId]);
    public type StableProjectTeams     = (ProjectHashKey, [TypCommon.UserId]);
    public type StableTimelines        = (ProjectTimeLineHashKey, TypProject.Timeline);
    public type StableProjectTimelines = (ProjectHashKey, [TypCommon.TimelineId]);

    public class Project(
        projectId            : Nat,
        timelineId           : Nat,
        dataProjects         : [StableProjects],
        dataProjectBalances  : [StableProjectBalances],
        dataUserProjects     : [StableUserProjects],
        dataProjectTeams     : [StableProjectTeams],
        dataTimelines        : [StableTimelines],
        dataProjectTimelines : [StableProjectTimelines],
    ) {
        public var nextProjectId    = projectId;
        public var nextTimelineId   = timelineId;
        public let projects         = HashMap.HashMap<ProjectHashKey, TypProject.Project>(dataProjects.size(), Blob.equal, Blob.hash);
        public let projectBalances  = HashMap.HashMap<ProjectHashKey, Nat>(dataProjectBalances.size(), Blob.equal, Blob.hash);
        public let userProjects     = HashMap.HashMap<TypCommon.UserId, [TypCommon.ProjectId]>(dataUserProjects.size(), Principal.equal, Principal.hash);
        public let projectTeams     = HashMap.HashMap<ProjectHashKey, [TypCommon.UserId]>(dataProjectTeams.size(), Blob.equal, Blob.hash);
        public let timelines        = HashMap.HashMap<ProjectHashKey, TypProject.Timeline>(dataTimelines.size(), Blob.equal, Blob.hash);
        public let projectTimelines = HashMap.HashMap<ProjectHashKey, [TypCommon.TimelineId]>(dataProjectTimelines.size(), Blob.equal, Blob.hash);

        public func getProjectPrimaryId(): Nat {
            let projectId = nextProjectId;
            nextProjectId += 1;
            return projectId;
        };

        public func getTimelinePrimaryId(): Nat {
            let projectId = nextTimelineId;
            nextTimelineId += 1;
            return projectId;
        };

        // MARK: Get project by id
        public func getProjectsByIds(ids: [TypCommon.ProjectId]) : [TypProject.Project] {
            let data = Buffer.Buffer<TypProject.Project>(ids.size());
            for (id in ids.vals()) {
                switch (findProjectById(id)) {
                    case (null) {};
                    case (?t)   { data.add(t) };
                }
            };
            return Buffer.toArray(data);
        };

        // MARK: Get user own filtered projects
        public func getUserProjects(
            userId : TypCommon.UserId, 
            filter : TypProject.ProjectFilter,
        ) : [TypProject.Project] {
            let projectIds = userProjects.get(userId);
            return switch(projectIds) {
                case(null) { [] };
                case(?ids) {
                    Array.filter<TypProject.Project>(
                        getProjectsByIds(ids), 
                        func (project) {
                            Text.contains(project.name, #text(filter.keyword)) or
                            Utl.hasAnyTag(filter.tags, project.tags) or
                            project.status == filter.status or
                            project.projectType == filter.projectType
                        }
                    );
                };
            };
        };

        // MARK: Create project
        public func createProject(
            ownerId : Principal, 
            req     : TypProject.ProjectRequest,
        ) : TypProject.Project {
            let data : TypProject.Project = {
                id          = getProjectPrimaryId();
                ownerId     = ownerId;
                name        = req.name;
                desc        = req.desc;
                tags        = req.tags;
                status      = #new;
                projectType = req.projectType;
                reward      = req.reward;
                isCompleted = false;
                thumbnail   = req.thumbnail;
                createdAt   = UtlDate.now();
                createdById = ownerId;
                updatedAt   = null;
                updatedById = null;
            };

            projects.put(Utl.natToBlob(data.id), data);

            if (req.projectType == #rewarded) {
                projectBalances.put(Utl.natToBlob(data.id), data.reward);
            };
            
            userProjects.put(
                ownerId,
                switch(userProjects.get(ownerId)) {
                    case (null)        { [data.id]; };
                    case (?projectsId) { Array.append<TypCommon.ProjectId>(projectsId, [data.id]); };
                }
            );

            
            let encodedProjectId = Utl.natToBlob(data.id);
            projectTeams.put(
                encodedProjectId,
                switch(projectTeams.get(encodedProjectId)) {
                    case (null)     { [ownerId]; };
                    case (?usersId) { Array.append<TypCommon.UserId>(usersId, [ownerId]); };
                }
            );

            return data;
        };

        // MARK: Find project by id
        public func findProjectById(projectId : TypCommon.ProjectId) : ?TypProject.Project {
            return switch (projects.get(Utl.natToBlob(projectId))) {
                case (null)    { return null; };
                case (project) { return project; };
            };
        };

        // MARK: Get project balance
        public func getProjectBalance(projectId : TypCommon.ProjectId) : Nat {
            switch(projectBalances.get(Utl.natToBlob(projectId))) {
                case (null)     { 0; };
                case (?balance) { balance; };
            };
        };

        // MARK: Update status
        public func updateStatus(
            userId    : TypCommon.UserId, 
            project   : TypProject.Project, 
            reqStatus : TypProject.ProjectStatus,
        ) : TypProject.Project {
            let data : TypProject.Project = {
                id          = project.id;
                ownerId     = project.ownerId;
                name        = project.name;
                desc        = project.desc;
                tags        = project.tags;
                status      = reqStatus;
                projectType = project.projectType;
                reward      = project.reward;
                isCompleted = project.isCompleted;
                thumbnail   = project.thumbnail;
                createdAt   = project.createdAt;
                createdById = project.createdById;
                updatedAt   = ?UtlDate.now();
                updatedById = ?userId;
            };

            projects.put(Utl.natToBlob(data.id), data);

            return data;
        };

        // MARK: Set project completed
        public func setProjectCompleted(
            userId     : TypCommon.UserId, 
            project    : TypProject.Project, 
        ) : TypProject.Project {
            let completeProject : TypProject.Project = {
                id          = project.id;
                ownerId     = project.ownerId;
                name        = project.name;
                desc        = project.desc;
                tags        = project.tags;
                status      = project.status;
                projectType = project.projectType;
                reward      = project.reward;
                isCompleted = true;
                thumbnail   = project.thumbnail;
                createdAt   = project.createdAt;
                createdById = project.createdById;
                updatedAt   = ?UtlDate.now();
                updatedById = ?userId;
            };

            projects.put(Utl.natToBlob(completeProject.id), completeProject);

            return completeProject;
        };

        // MARK: Response mapper
        public func mappedToResponse(
            project   : TypProject.Project,
            listTeams : [TypUser.UserResponse],
            listTasks : [TypTask.TaskResponse],
        ) : TypProject.ProjectResponse {
            let mapped : TypProject.ProjectResponse = {
                id          = project.id;
                ownerId     = project.ownerId;
                name        = project.name;
                tags        = project.tags;
                status      = project.status;
                projectType = project.projectType;
                reward      = project.reward;
                isCompleted = project.isCompleted;
                thumbnail   = project.thumbnail;
                teams       = listTeams;
                totalTasks  = listTasks.size();
                tasks       = listTasks;
                createdAt   = project.createdAt;
                createdById = project.createdById;
                updatedAt   = project.updatedAt;
                updatedById = project.updatedById;
            };

            return mapped;
        };

        // MARK: Assign user to team project
        public func assignToTeamProject(
            projectId : TypCommon.ProjectId, 
            usersId   : [TypCommon.UserId], 
        ) : () {
            for(userId in usersId.vals()) {
                userProjects.put(
                    userId,
                    switch(userProjects.get(userId)) {
                        case (null)        { [projectId]; };
                        case (?projectsId) { Array.append<TypCommon.ProjectId>(projectsId, [projectId]); };
                    }
                );

                let encodedProjectId = Utl.natToBlob(projectId);
                projectTeams.put(
                    encodedProjectId,
                    switch(projectTeams.get(encodedProjectId)) {
                        case (null)     { [userId]; };
                        case (?usersId) { Array.append<TypCommon.UserId>(usersId, [userId]); };
                    }
                );
            };
        };

        // MARK: Create timeline
        public func createTimeline(
            projectId : TypCommon.ProjectId, 
            req       : TypProject.TimelineRequest, 
        ) : TypProject.Timeline {
            let data : TypProject.Timeline = {
                id        = getTimelinePrimaryId();
                title     = req.title;
                startDate = req.startDate;
                endDate   = req.endDate;
            };

            timelines.put(Utl.natToBlob(data.id), data);

            let encodedProjectId = Utl.natToBlob(projectId);
            projectTimelines.put(
                encodedProjectId,
                switch(projectTimelines.get(encodedProjectId)) {
                    case (null)         { [data.id]; };
                    case (?timelinesId) { Array.append<TypCommon.TimelineId>(timelinesId, [data.id]); };
                }
            );

            return data;
        };

        // MARK: Get timeline by ids
        public func getTimelinesByIds(ids: [TypCommon.TimelineId]) : [TypProject.Timeline] {
            let data = Buffer.Buffer<TypProject.Timeline>(ids.size());
            for (id in ids.vals()) {
                switch (timelines.get(Utl.natToBlob(id))) {
                    case (null) {};
                    case (?tl)  { data.add(tl) };
                }
            };
            return Buffer.toArray(data);
        };
    }

}