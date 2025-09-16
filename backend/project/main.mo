import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Text "mo:base/Text";

import TypCommon "../common/type";
import TypProject "type";

import SvcProject "service";

import Utl "../utils/helper";

persistent actor {
    private var nextBlockCounter : TypCommon.BlockId    = 0;
    private var nextProjectId    : TypCommon.ProjectId  = 1;
    private var nextTimelineId   : TypCommon.TimelineId = 1;

    private var stableBlockchain       : [SvcProject.StableBlockchain]       = [];
    private var stableProjectIndex     : [SvcProject.StableProjectIndex]     = [];
    private var stableTimelineIndex    : [SvcProject.StableTimelineIndex]    = [];
    private var stableUserProjectIndex : [SvcProject.StableUserProjectIndex] = [];
    private var stableProjectTeamIndex : [SvcProject.StableProjectTeamIndex] = [];

    transient let project = SvcProject.Project(
        nextBlockCounter,
        nextProjectId, 
        nextTimelineId,
        stableBlockchain,
        stableProjectIndex,
        stableTimelineIndex,
        stableUserProjectIndex,
        stableProjectTeamIndex,
    );

    // MARK: System

    system func preupgrade() {
        // stableProjects         := Iter.toArray(project.projects.entries());
        // stableProjectProjects  := Iter.toArray(project.projectBalances.entries());
        // stableUserProjects     := Iter.toArray(project.userProjects.entries());
        // stableProjectTeams     := Iter.toArray(project.projectTeams.entries());
        // stableTimelines        := Iter.toArray(project.timelines.entries());
        // stableProjectTimelines := Iter.toArray(project.projectTimelines.entries());
    };

    system func postupgrade() {
        // stableProjects         := [];
        // stableProjectProjects  := [];
        // stableUserProjects     := [];
        // stableProjectTeams     := [];
        // stableTimelines        := [];
        // stableProjectTimelines := [];
    };

    // MARK: Get owned project list

    public shared query({caller}) func getOwnedProjectList(
        filter : TypProject.ProjectFilter
    ) : async Result.Result<[TypProject.Project], ()>  {
        switch (project.userProjectIndex.get(caller)) {
            case (null)        { return #ok([]); };
            case (?projectIds) {
                let result = Array.mapFilter<TypCommon.ProjectId, TypProject.Project>(
                    projectIds,
                    func(projectId: TypCommon.ProjectId): ?TypProject.Project {
                        switch (project.getCurrentProjectState(projectId)) {
                            case (null)  { null; };
                            case (?data) {
                                // Keyword filter
                                let keywordMatch = switch (filter.keyword) {
                                    case (null) { true; };
                                    case (?keyword) { 
                                        if (keyword == "") { 
                                            true;
                                        } else {
                                            Text.contains(data.name, #text keyword) or
                                            Text.contains(data.desc, #text keyword); 
                                        };
                                    };
                                };
                                
                                // Tags filter  
                                let tagsMatch = switch (filter.tags) {
                                    case (null) { true; };
                                    case (?tagsList) { 
                                        if (tagsList.size() == 0) {
                                            true;
                                        } else {
                                            Utl.hasAnyTag(tagsList, data.tags);
                                        };
                                    };
                                };
                                
                                // Status filter
                                let statusMatch = switch (filter.status) {
                                    case (null) { true; };
                                    case (?filterStatus) { data.status == filterStatus; };
                                };
                                
                                // Project type filter
                                let typeMatch = switch (filter.projectType) {
                                    case (null) { true; };
                                    case (?filterType) { data.projectType == filterType; };
                                };
                                
                                // ✅ ALL conditions must be true (AND logic)
                                if (keywordMatch and tagsMatch and statusMatch and typeMatch) {
                                    return ?data;
                                };
                                
                                null;
                            };
                        };
                    }
                );

                return #ok(result);
            };
        };
    };

    // MARK: Create project

    public shared ({caller}) func createProject(
        req : TypProject.ProjectRequest,
    ) : async Result.Result<TypProject.Project, Text> {
        if (not project.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };

        // TODO: Cek token
        // let balance = await CanToken.balanceOf(caller);
        // if (req.projectType == #rewarded and balance < req.reward) {
        //     return #err("Insufficient balances")
        // };
        
        let result = project.createProject(caller, req);
        // ignore CanToken.updateBalance(caller, balance - req.reward);

        return #ok(result);
	};

    // MARK: Get project detail
    public query func getProjectDetail(
        projectId : TypCommon.ProjectId,
    ) : async Result.Result<TypProject.Project, Text>  {
        switch(project.getCurrentProjectState(projectId)) {
            case(null)  { return #err("Project not found"); };
            case(?data) {
                return #ok(data);
            };
        };
    };

    // MARK: Update status
    public shared ({caller}) func updateProjectStatus(
        projectId : TypCommon.ProjectId,
        reqStatus : TypProject.ProjectStatus,
    ) : async Result.Result<TypProject.Project, Text> {
        if (not project.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };
        
        switch(project.getCurrentProjectState(projectId)) {
            case(null)  { return #err("Project not found") };
            case(?data) { 
                let result = project.updateStatus(caller, data, reqStatus);
                return #ok(result);
            };
        };
    };

    // MARK: Get project team
    
    public query func getProjectTeam(
        projectId : TypCommon.ProjectId,
    ) : async Result.Result<[TypCommon.UserId], Text> {
        switch(project.getCurrentProjectState(projectId)) {
            case(null)  { return #err("Project not found") };
            case(?_) { 
                switch (project.projectTeamIndex.get(Utl.natToBlob(projectId))) {
                    case (null)     { #ok([]); };
                    case (?userIds) { #ok(userIds) };
                };
            };
        };
    };

    // MARK: Get project history

    public query func getProjectHistory(
        projectId : TypCommon.ProjectId,
    ) : async Result.Result<[TypProject.ProjectBlock], Text> {
        switch (project.projectIndex.get(Utl.natToBlob(projectId))) {
            case (null)      { #err("Project not found"); };
            case (?blockIds) {
                let blocks = Array.mapFilter<Blob, TypProject.ProjectBlock>(
                    blockIds,
                    func blockId = project.blockchain.get(blockId)
                );
                return #ok(blocks);
            };
        };
    };

    // MARK: Assign user to team project
    public shared ({ caller }) func assignProjectTeam(
        projectId : TypCommon.ProjectId,
        usersId   : [TypCommon.UserId], 
    ) : async Result.Result<Text, Text> {
        if (not project.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };

       project.assignToTeamProject(caller, projectId, usersId);
       
        return #ok("Berhasil menugaskan " # Nat.toText(usersId.size()) # " user ke projek.");
    };

    // MARK: Get project timelines

    public query func getProjectTimelines(
        projectId : TypCommon.ProjectId,
    ) : async Result.Result<[TypProject.Timeline], Text> {
        if (not project.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };

        var projectTimelines: [TypProject.Timeline] = [];
        
        // Scan through all timeline indices to find ones belonging to this project
        for ((timelineId, blockIds) in project.timelineIndex.entries()) {
            if (blockIds.size() > 0) {
                let latestBlockId = blockIds[blockIds.size() - 1];
                switch (project.blockchain.get(latestBlockId)) {
                    case (null)   { }; // Skip missing blocks
                    case (?block) {
                        switch (block.data) {
                            case (#timeline(data)) {
                                if (data.projectId == projectId) {
                                    projectTimelines := Array.append(projectTimelines, [data]);
                                };
                            };
                            case (_) { }; // Skip non-timeline blocks
                        };
                    };
                };
            };
        };
        
        #ok(projectTimelines);
	};

    // MARK: Create timeline
    
    public shared ({ caller }) func createTimeline(
        projectId : TypCommon.ProjectId,
        req       : TypProject.TimelineRequest,
    ) : async Result.Result<TypProject.Timeline, Text> {
        if (not project.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };

        return #ok(project.createTimeline(caller, projectId, req));
	};

    // MARK: Get timeline detail

    public query func getTimelineDetail(
        timelineId : TypCommon.TimelineId,
    ) : async Result.Result<TypProject.Timeline, Text>  {
        switch(project.findTimelineById(timelineId)) {
            case(null)  { return #err("Timeline not found") };
            case(?data) { return #ok(data); };
        };
    };

    // MARK: Update status

    public shared ({caller}) func updateTimeline(
        timelineId : TypCommon.TimelineId,
        req        : TypProject.TimelineRequest,
    ) : async Result.Result<TypProject.Timeline, Text> {
        if (not project.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };
        
        switch(project.findTimelineById(timelineId)) {
            case(null)  { return #err("Timeline not found") };
            case(?data) { 
                let result = project.updateTimeline(caller, data, req);
                return #ok(result);
            };
        };
    };

    // MARK: Get timeline history

    public query func getTimelineHistory(
        timelineId : TypCommon.TimelineId,
    ) : async Result.Result<[TypProject.ProjectBlock], Text> {
        switch (project.timelineIndex.get(Utl.natToBlob(timelineId))) {
            case (null)      { #err("Timeline not found"); };
            case (?blockIds) {
                let blocks = Array.mapFilter<Blob, TypProject.ProjectBlock>(
                    blockIds,
                    func blockId = project.blockchain.get(blockId)
                );
                return #ok(blocks);
            };
        };
    };

    public query func healthCheck(): async {
        totalBlocks    : Nat;
        chainIntegrity : Bool;
        lastBlockHash  : Text;
        totalProjects  : Nat;
        totalTimelines : Nat;
    } {
        let integrity    = project.verifyChainIntegrity();
        let blockCounter = project.blockCounter;
        let lastHash     = if (blockCounter > 0) {
            let prevBlockKey = Nat.sub(blockCounter, 1);
            switch (project.blockchain.get(Utl.natToBlob(prevBlockKey))) {
                case (null)   { "No blocks" };
                case (?block) { block.hash };
            };
        } else {
            project.GENESIS_HASH;
        };
        
        return {
            totalBlocks    = blockCounter;
            chainIntegrity = integrity;
            lastBlockHash  = lastHash;
            totalProjects  = project.projectIndex.size();
            totalTimelines = project.timelineIndex.size();
        };
    };

    // // MARK: Save project, timelines from llm
    // public func saveLlmProjectTimelines(
    //     p : TypProject.Project,
    //     tls : [TypProject.Timeline],
    // ) : async TypCommon.ProjectId {
    //     let dataProject : TypProject.Project = {
    //         id          = project.getProjectPrimaryId();
    //         ownerId     = p.ownerId;
    //         name        = p.name;
    //         desc        = p.desc;
    //         tags        = p.tags;
    //         status      = p.status;
    //         projectType = p.projectType;
    //         reward      = p.reward;
    //         isCompleted = p.isCompleted;
    //         thumbnail   = p.thumbnail;
    //         createdAt   = p.createdAt;
    //         createdById = p.ownerId;
    //         updatedAt   = p.updatedAt;
    //         updatedById = p.updatedById;
    //     };

    //     project.projects.put(Utl.natToBlob(dataProject.id), dataProject);
    //     project.userProjects.put(
    //         p.ownerId,
    //         switch(project.userProjects.get(p.ownerId)) {
    //             case (null)        { [dataProject.id]; };
    //             case (?projectsId) { Array.append<TypCommon.ProjectId>(projectsId, [dataProject.id]); };
    //         }
    //     );

        
    //     let encodedProjectId = Utl.natToBlob(dataProject.id);
    //     project.projectTeams.put(
    //         encodedProjectId,
    //         switch(project.projectTeams.get(encodedProjectId)) {
    //             case (null)     { [p.ownerId]; };
    //             case (?usersId) { Array.append<TypCommon.UserId>(usersId, [p.ownerId]); };
    //         }
    //     );

    //     for(tl in tls.vals()) {
    //         let dataTimeline : TypProject.Timeline = {
    //             id        = project.getTimelinePrimaryId();
    //             title     = tl.title;
    //             startDate = tl.startDate;
    //             endDate   = tl.endDate;
    //         };

    //         project.timelines.put(Utl.natToBlob(dataTimeline.id), dataTimeline);
    //         project.projectTimelines.put(
    //             encodedProjectId,
    //             switch(project.projectTimelines.get(encodedProjectId)) {
    //                 case (null)         { [dataTimeline.id]; };
    //                 case (?timelinesId) { Array.append<TypCommon.TimelineId>(timelinesId, [dataTimeline.id]); };
    //             }
    //         );
    //     };


    //     return dataProject.id;
	// };

}