import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";

import TypCommon "../common/type";
import TypProject "type";
import TypUser "../user/type";

import UtlDate "../utils/date";
import Utl "../utils/helper";


module {
    private type ProjectHashKey       = Blob;
    public type StableProject         = (TypCommon.ProjectId, TypProject.Project);
    public type StableProjectBalances = (TypCommon.ProjectId, Nat);
    public type StableMembers         = (TypCommon.ProjectId, [TypCommon.UserId]);

    public class Project(
        projectId : Nat,
        dataProjects : [StableProject],
        dataProjectBalances : [StableProjectBalances],
        dataProjectMembers : [StableMembers],
    ) {
        public var nextProjectId = projectId;
        
        public let projects = HashMap.HashMap<
            TypCommon.ProjectId,
            TypProject.Project, 
        >(dataProjects.size(), Nat.equal, Hash.hash);

        public let projectBalances = HashMap.HashMap<
            TypCommon.ProjectId,
            Nat, // Amount of tokens.
        >(dataProjectBalances.size(), Nat.equal, Hash.hash);

        public let members = HashMap.HashMap<
            TypCommon.ProjectId, 
            [TypCommon.UserId],
        >(dataProjectMembers.size(), Nat.equal, Hash.hash);

        public func getPrimaryId(): Nat {
            let projectId = nextProjectId;
            nextProjectId += 1;
            return projectId;
        };

        private func mapProjectList(project : TypProject.Project) : TypProject.ProjectList {
            let data: TypProject.ProjectList = {
                id          = project.id;
                ownerId     = project.ownerId;
                name        = project.name;
                rewardType  = project.rewardType;
                reward      = project.reward;
                isCompleted = project.isCompleted;
            };

            return data;
        };

        public func getProjectsByUserTags(user : TypUser.User) : [TypProject.ProjectList] {
            let list = Buffer.Buffer<TypProject.ProjectList>(0);
            for (project in projects.vals()) {
                if (Utl.hasAnyTag(user.tags, project.tags)) {
                    // TODO: Conditional timelane
                    list.add(mapProjectList(project));
                };
            };

            Buffer.toArray(list);
        };

        public func getProjectsByName(name : Text) : [TypProject.ProjectList] {
            let list = Buffer.Buffer<TypProject.ProjectList>(0);
            for (project in projects.vals()) {
                if (Text.contains(project.name, #text name)) {
                    list.add(mapProjectList(project));
                }
            };

            Buffer.toArray(list);
        };

        public func createProject(principal : Principal, req : TypProject.ProjectRequest) : TypProject.Project {
            let project: TypProject.Project = {
                id          = getPrimaryId();
                ownerId     = principal;
                name        = req.name;
                tags        = req.tags;
                status      = #new;
                rewardType  = req.rewardType;
                reward      = req.reward;
                isCompleted = true;
                isPublic    = req.isPublic;
                tasks       = [];
                createdAt   = UtlDate.now();
            };

            putProject(project);

            if (req.rewardType == #rewarded) {
                projectBalances.put(project.id, project.reward);
            };
            
            switch(members.get(project.id)) {
                case (null) { members.put(project.id, [principal]); };
                case (?membersId) {
                    members.put(project.id, Array.append<TypCommon.UserId>(membersId, [principal]));
                };
            };

            return project;
        };

        // TODO: COMPLETE THIS 
        public func getProjectsDetail(name : Text) : [TypProject.ProjectList] {
            let list = Buffer.Buffer<TypProject.ProjectList>(0);
            for (project in projects.vals()) {
                if (Text.contains(project.name, #text name)) {
                    list.add(mapProjectList(project));
                }
            };

            Buffer.toArray(list);
        };

        public func putProject(project: TypProject.Project) {
            projects.put(project.id, project);
        };

        public func getProjectBalance(projectId : TypCommon.ProjectId) : Nat {
            switch(projectBalances.get(projectId)) {
                case (null)     { 0; };
                case (?balance) { balance; };
            };
        };
    }
}