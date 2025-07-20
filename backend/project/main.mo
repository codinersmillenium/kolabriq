import Result "mo:base/Result";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";

import TypCommon "../common/type";
import TypUser "../user/type";
import TypTask "../task/type";
import TypProject "type";

import SvcProject "service";

import Utl "../utils/helper";

import CanTask "canister:task";
import CanUser "canister:user";
import CanToken "canister:token";

actor {
    private stable var nextProjectId   : TypCommon.ProjectId = 0;
    private stable var nexttTimelineId : TypCommon.TimelineId = 0;

    private stable var stableProjects         : [SvcProject.StableProjects]         = [];
    private stable var stableProjectProjects  : [SvcProject.StableProjectBalances]  = [];
    private stable var stableUserProjects     : [SvcProject.StableUserProjects]     = [];
    private stable var stableProjectTeams     : [SvcProject.StableProjectTeams]     = [];
    private stable var stableTimelines        : [SvcProject.StableTimelines]        = [];
    private stable var stableProjectTimelines : [SvcProject.StableProjectTimelines] = [];

    private let project = SvcProject.Project(
        nextProjectId, 
        nexttTimelineId, 
        stableProjects, 
        stableProjectProjects, 
        stableUserProjects,
        stableProjectTeams,
        stableTimelines,
        stableProjectTimelines,
    );

    // MARK: Get owned project list
    public shared ({caller}) func getOwnedProjectList(
        filter : TypProject.ProjectFilter
    ) : async Result.Result<[TypProject.ProjectList], ()>  {
        let dataProjects = project.getUserProjects(caller, filter);
        let result       = Buffer.Buffer<TypProject.ProjectList>(dataProjects.size());

        for(p in dataProjects.vals()) {
            let totalTask = await CanTask.getTotalTasksProject(p.id);
            let teams = switch(project.projectTeams.get(Utl.natToBlob(p.id))) {
                case(null)     { [] };
                case(?usersId) {
                    switch(await CanUser.getUsersByIds(usersId)) {
                        case(#ok(userResponse)) { userResponse };
                        case(_)                 { [] };
                    };
                };
            };

            let listMapped : TypProject.ProjectList = {
                id          = p.id;
                ownerId     = p.ownerId;
                name        = p.name;
                projectType = p.projectType;
                reward      = p.reward;
                isCompleted = p.isCompleted;
                teams       = teams;
                totalTask   = totalTask;
                createdAt   = p.createdAt;
                createdById = p.createdById;
            };

            result.add(listMapped);
        };

        return #ok(Buffer.toArray(result));
    };

    // MARK: Get project detail
    public shared func getProjectDetail(
        projectId : TypCommon.ProjectId,
    ) : async Result.Result<TypProject.ProjectResponse, Text>  {
        switch(project.findProjectById(projectId)) {
            case(null)  { return #err("Projek tidak ditemukan"); };
            case(?p) {
                var totalTask : Nat = 0;
                let teams    = Buffer.Buffer<TypUser.UserResponse>(0);
                let taskList = Buffer.Buffer<TypTask.TaskResponse>(0);

                switch(await CanTask.getProjectTasks(projectId)) {
                    case(#ok(tasks)) {
                        totalTask := tasks.size();
                        for(task in tasks.vals()) {
                            taskList.add(task);
                            for(assignedUserId in task.assignees.vals()) {
                                let hasBeenAdded = Buffer.forSome<TypUser.UserResponse>(
                                    teams, 
                                    func userId { userId == assignedUserId }
                                );

                                if (not hasBeenAdded) teams.add(assignedUserId);
                            };
                        };
                    };
                    case(_) {};
                };

                return #ok(project.mappedToResponse(p, Buffer.toArray(teams), Buffer.toArray(taskList)));
            };
        };
    };

    // MARK: Update status
    public shared ({caller}) func updateStatus(
        projectId : TypCommon.ProjectId,
        reqStatus : TypProject.ProjectStatus,
    ) : async Result.Result<TypProject.ProjectResponse, Text> {
        switch(project.findProjectById(projectId)) {
            case(null) { return #err("Terjadi kesalahan, projek tidak ditemukan.") };
            case(?p)   { 
                let dataProject = project.updateStatus(caller, p, reqStatus);
                return #ok(project.mappedToResponse(dataProject, [], []));
            };
        };
    };

    // MARK: Mark project complete
    public shared ({caller}) func markProjectComplete(
        projectId : TypCommon.ProjectId,
        reqPayout : [TypProject.PayoutRequest],
    ) : async Result.Result<Text, Text> {
        switch(project.findProjectById(projectId)) {
            case(null) { return #err("Terjadi kesalahan, projek tidak ditemukan.") };
            case(?p)   { 
                if (p.ownerId != caller) return #err("Proses tidak diizinkan");

                ignore project.updateStatus(caller, p, #done);
                for(req in reqPayout.vals()) {
                    ignore CanToken.updateBalance(req.userId, req.reward);
                };
                return #ok("Projek " # p.name # " sudah selesai. Reward berhasil didistibusikan.");
            };
        };
    };

    // MARK: Get project team
    public shared func getProjectTeam(
        projectId : TypCommon.ProjectId,
    ) : async Result.Result<[TypUser.UserResponse], Text> {
        switch(project.projectTeams.get(Utl.natToBlob(projectId))) {
            case(null)     { return #err("Terjadi kesalahan, projek tidak ditemukan.") };
            case(?usersId) { 
                switch(await CanUser.getUsersByIds(usersId)) {
                    case(#ok(users)) { return #ok(users); };
                    case(_)          { #ok([]) };
                };
             };
        };
    };

    // MARK: Assign user to team project
    public shared func assignProjectTeam(
        projectId : TypCommon.ProjectId,
        usersId   : [TypCommon.UserId], 
    ) : async Result.Result<Text, Text> {
        project.assignToTeamProject(projectId, usersId);
        return #ok("Berhasil menugaskan " # Nat.toText(usersId.size()) # " user ke projek.");
    };

    // MARK: Create project
    public shared ({caller}) func createProject(
        req : TypProject.ProjectRequest,
    ) : async Result.Result<TypProject.ProjectResponse, Text> {
        let balance = await CanToken.balanceOf(caller);
        if (req.projectType == #rewarded and balance < req.reward) {
            return #err("Token tidak mencukupi")
        };
        
        let result = project.createProject(caller, req);
        ignore CanToken.updateBalance(caller, balance - req.reward);

        return #ok(project.mappedToResponse(result, [], []));
	};

    // MARK: Create timeline
    public shared func createTimeline(
        projectId : TypCommon.ProjectId,
        req       : TypProject.TimelineRequest,
    ) : async Result.Result<TypProject.Timeline, ()> {
        return #ok(project.createTimeline(projectId, req));
	};

    // MARK: Get timeline by ids
    public shared func getTimelinesByIds(
        projectId : TypCommon.ProjectId,
    ) : async Result.Result<[TypProject.Timeline], Text> {
        switch(project.projectTimelines.get(Utl.natToBlob(projectId))) {
            case(null)         { return #err("Projek tidak ditemukan") };
            case(?timelinesId) { return #ok(project.getTimelinesByIds(timelinesId)); };
        };
	};

    // MARK: System

    system func preupgrade() {
        stableProjects         := Iter.toArray(project.projects.entries());
        stableProjectProjects  := Iter.toArray(project.projectBalances.entries());
        stableUserProjects     := Iter.toArray(project.userProjects.entries());
        stableProjectTeams     := Iter.toArray(project.projectTeams.entries());
        stableTimelines        := Iter.toArray(project.timelines.entries());
        stableProjectTimelines := Iter.toArray(project.projectTimelines.entries());
    };

    system func postupgrade() {
        stableProjects         := [];
        stableProjectProjects  := [];
        stableUserProjects     := [];
        stableProjectTeams     := [];
        stableTimelines        := [];
        stableProjectTimelines := [];
    };

}