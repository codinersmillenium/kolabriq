import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Blob "mo:base/Blob";

import TypCommon "../common/type";
import TypProject "type";

import UtlProject "util";
import UtlDate "../utils/date";
import Utl "../utils/helper";

module {
    private type BlockHashKey    = Blob;
    private type ProjectHashKey  = Blob;
    private type TimelineHashKey = Blob;

    public type StableBlockchain       = (BlockHashKey, TypProject.ProjectBlock);
    public type StableProjectIndex     = (ProjectHashKey, [BlockHashKey]);
    public type StableTimelineIndex    = (TimelineHashKey, [BlockHashKey]);
    public type StableUserProjectIndex = (TypCommon.UserId, [TypCommon.ProjectId]);
    public type StableProjectTeamIndex = (ProjectHashKey, [TypCommon.UserId]);

    public class Project(
        blockId              : TypCommon.BlockId,
        projectId            : TypCommon.ProjectId,
        timelineId           : TypCommon.TimelineId,
        dataBlockchain       : [StableBlockchain],
        dataProjectIndex     : [StableProjectIndex],
        dataTimelineIndex    : [StableTimelineIndex],
        dataUserProjectIndex : [StableUserProjectIndex],
        dataProjectTeamIndex : [StableProjectTeamIndex],
    ) {
        public var blockCounter   = blockId;
        public var nextProjectId  = projectId;
        public var nextTimelineId = timelineId;

        public var blockchain       = HashMap.HashMap<BlockHashKey, TypProject.ProjectBlock>(dataBlockchain.size(), Blob.equal, Blob.hash);
        public var projectIndex     = HashMap.HashMap<ProjectHashKey, [BlockHashKey]>(dataProjectIndex.size(), Blob.equal, Blob.hash );
        public var timelineIndex    = HashMap.HashMap<TimelineHashKey, [BlockHashKey]>(dataTimelineIndex.size(), Blob.equal, Blob.hash );
        public var userProjectIndex = HashMap.HashMap<TypCommon.UserId, [TypCommon.ProjectId]>(dataUserProjectIndex.size(), Principal.equal, Principal.hash);
        public var projectTeamIndex = HashMap.HashMap<ProjectHashKey, [TypCommon.UserId]>(dataProjectTeamIndex.size(), Blob.equal, Blob.hash);

        public let GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

        // MARK: Get previous hash

        private func getPreviousHash(): Text {
            if (blockCounter == 0) {
                return GENESIS_HASH;
            } else {
                let prevBlockKey = Nat.sub(blockCounter, 1);
                switch (blockchain.get(Utl.natToBlob(prevBlockKey))) {
                    case (?block) { block.hash };
                    case (null)   { GENESIS_HASH };
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

                        let recalculatedHash = UtlProject.calculateHash(currentBlock);
                        if (currentBlock.hash != recalculatedHash) return false;
                    };
                    case (_, _) { return false; };
                };

                currentIndex += 1;
            };

            return true;
        };

        // MARK: Incremental id

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

        // MARK: Create project

        public func createProject(
            caller  : Principal, 
            req     : TypProject.ProjectRequest,
        ) : TypProject.Project {
            let projectData : TypProject.Project = {
                id          = getProjectPrimaryId();
                ownerId     = caller;
                name        = req.name;
                desc        = req.desc;
                tags        = req.tags;
                status      = #new;
                projectType = req.projectType;
                reward      = req.reward;
                thumbnail   = req.thumbnail;
                createdBy   = caller;
                action      = #create;
            };

            var newBlock: TypProject.ProjectBlock = {
                id           = blockCounter;
                timestamp    = UtlDate.now();
                previousHash = getPreviousHash();
                data         = #project(projectData);
                hash         = "";
                signature    = Principal.toText(caller) # "_signature";
                nonce        = 0;
            };

            // Add to blockchain
            let blobBlockCounter = Utl.natToBlob(blockCounter);
            blockchain.put(blobBlockCounter, UtlProject.hashBlock(newBlock));
            
            // Update indices
            let blobProjectId = Utl.natToBlob(projectData.id);
            projectIndex.put(blobProjectId, [blobBlockCounter]);
            
            // Add owner to user-project index
            switch (userProjectIndex.get(caller)) {
                case (null)      { userProjectIndex.put(caller, [projectData.id]); };
                case (?projects) { userProjectIndex.put(caller, Array.append(projects, [projectData.id])); };
            };
            
            // Initialize project team with owner
            projectTeamIndex.put(blobProjectId, [caller]);

            blockCounter += 1;
            return projectData;
        };

        // MARK: Get curr project state

        public func getCurrentProjectState(projectId: TypCommon.ProjectId): ?TypProject.Project {
            switch (projectIndex.get(Utl.natToBlob(projectId))) {
                case (null)      { return null; };
                case (?blockIds) {
                    if (blockIds.size() == 0) return null;
                    
                    // Find the latest project data block (not team assignment)
                    var i = blockIds.size();
                    while (i > 0) {
                        i -= 1;
                        switch (blockchain.get(blockIds[i])) {
                            case (null)   { };
                            case (?block) {
                                switch (block.data) {
                                    case (#project(data)) { return ?data; };
                                    case (_)              { }; // Skip non-project blocks
                                };
                            };
                        };
                    };

                    return null;
                };
            };
        };

        // MARK: Update status
        public func updateStatus(
            caller    : TypCommon.UserId, 
            project   : TypProject.Project, 
            reqStatus : TypProject.ProjectStatus,
        ) : TypProject.Project {
            let projectData: TypProject.Project = {
                project with
                status = reqStatus;
                action = #statusUpdate({
                    from = project.status;
                    to   = reqStatus;
                });
            };

            var newBlock: TypProject.ProjectBlock = {
                id           = blockCounter;
                timestamp    = UtlDate.now();
                previousHash = getPreviousHash();
                data         = #project(projectData);
                hash         = "";
                signature    = Principal.toText(caller) # "_signature";
                nonce        = 0;
            };

            // Add to blockchain
            let blobBlockCounter = Utl.natToBlob(blockCounter);
            blockchain.put(blobBlockCounter, UtlProject.hashBlock(newBlock));

            // Update indices
            let blobProjectId = Utl.natToBlob(projectData.id);
            switch (projectIndex.get(blobProjectId)) {
                case (?blocks) { projectIndex.put(blobProjectId, Array.append(blocks, [blobBlockCounter])); };
                case (null)    { };
            };

            blockCounter += 1;
            return projectData;
        };

        // MARK: Assign user to project
        
        public func assignToTeamProject(
            caller    : TypCommon.UserId, 
            projectId : TypCommon.ProjectId, 
            userIds   : [TypCommon.UserId], 
        ) : () {
            for(userId in userIds.vals()) {
                let teamData: TypProject.TeamAssignment = {
                    projectId  = projectId;
                    userId     = userId;
                    assignedBy = caller;
                    action     = #assign;
                };

                var newBlock: TypProject.ProjectBlock = {
                    id           = blockCounter;
                    timestamp    = UtlDate.now();
                    previousHash = getPreviousHash();
                    data         = #teamAssignment(teamData);
                    hash         = "";
                    signature    = Principal.toText(caller) # "_signature";
                    nonce        = 0;
                };

                // Add to blockchain
                let blobBlockCounter = Utl.natToBlob(blockCounter);
                blockchain.put(blobBlockCounter, UtlProject.hashBlock(newBlock));
                
                // Update indices
                let blobProjectId = Utl.natToBlob(projectId);
                switch (userProjectIndex.get(userId)) {
                    case (null)      { userProjectIndex.put(userId, [projectId]); };
                    case (?projects) { userProjectIndex.put(userId, Array.append(projects, [projectId])); };
                };
                
                switch (projectTeamIndex.get(blobProjectId)) {
                    case (?team) {
                        // Check if user already in team
                        if (Array.find<TypCommon.UserId>(team, func(u) = u == userId) == null) {
                            projectTeamIndex.put(blobProjectId, Array.append(team, [userId]));
                        };
                    };
                    case (null) { projectTeamIndex.put(blobProjectId, [userId]); };
                };

                blockCounter += 1;
                return;
            };
        };

        // MARK: Create timeline
        
        public func createTimeline(
            caller    : TypCommon.UserId, 
            projectId : TypCommon.ProjectId, 
            req       : TypProject.TimelineRequest, 
        ) : TypProject.Timeline {
            let timelineData : TypProject.Timeline = {
                id        = getTimelinePrimaryId();
                projectId = projectId;
                title     = req.title;
                startDate = req.startDate;
                endDate   = req.endDate;
                createdBy = caller;
                action    = #create;
            };

            var newBlock: TypProject.ProjectBlock = {
                id           = blockCounter;
                timestamp    = UtlDate.now();
                previousHash = getPreviousHash();
                data         = #timeline(timelineData);
                hash         = "";
                signature    = Principal.toText(caller) # "_signature";
                nonce        = 0;
            };

            // Add to blockchain
            let blobBlockCounter = Utl.natToBlob(blockCounter);
            blockchain.put(blobBlockCounter, UtlProject.hashBlock(newBlock));

            // Update indices
            timelineIndex.put(Utl.natToBlob(timelineData.id), [blobBlockCounter]);

            blockCounter += 1;
            return timelineData;
        };


        // MARK: Find timeline

        public func findTimelineById(timelineId : TypCommon.TimelineId) : ?TypProject.Timeline {
            switch (timelineIndex.get(Utl.natToBlob(timelineId))) {
                case (null)      { null; };
                case (?blockIds) {
                    if (blockIds.size() == 0) return null;
                
                    let latestBlockId = blockIds[blockIds.size() - 1];
                    switch (blockchain.get(latestBlockId)) {
                        case (null)   { null; };
                        case (?block) {
                            switch (block.data) {
                                case (#timeline(data)) { ?data; };
                                case (_)               { null; };
                            };
                        };
                    };
                };
            };
        };

        // MARK: Update timeline

        public func updateTimeline(
            caller   : TypCommon.UserId, 
            timeline : TypProject.Timeline, 
            req      : TypProject.TimelineRequest, 
        ) : TypProject.Timeline {
            let action = if (req.title != timeline.title) {
                #metadataUpdate({
                    field    = "title";
                    oldValue = timeline.title;
                    newValue = req.title;
                });
            } else if (req.startDate != timeline.startDate) {
                #dateUpdate({
                    field    = "startDate";
                    oldValue = timeline.startDate;
                    newValue = req.startDate;
                });
            } else if (req.endDate != timeline.endDate) {
                #dateUpdate({
                    field    = "endDate";
                    oldValue = timeline.endDate;
                    newValue = req.endDate;
                });
            } else {
                #metadataUpdate({ field = "general"; oldValue = ""; newValue = "updated"; });
            };

            let timelineData : TypProject.Timeline = {
                timeline with
                title     = req.title;
                startDate = req.startDate;
                endDate   = req.endDate;
                action    = action;
            };

            var newBlock: TypProject.ProjectBlock = {
                id           = blockCounter;
                timestamp    = UtlDate.now();
                previousHash = getPreviousHash();
                data         = #timeline(timelineData);
                hash         = "";
                signature    = Principal.toText(caller) # "_signature";
                nonce        = 0;
            };

            // Add to blockchain
            let blobBlockCounter = Utl.natToBlob(blockCounter);
            blockchain.put(blobBlockCounter, UtlProject.hashBlock(newBlock));

            // Update indices
            let blobTimelineId = Utl.natToBlob(timelineData.id);
            switch (timelineIndex.get(blobTimelineId)) {
                case (?blocks) { timelineIndex.put(blobTimelineId, Array.append(blocks, [blobBlockCounter])); };
                case (null)    {  };
            };

            blockCounter += 1;
            return timelineData;
        };
    }

}