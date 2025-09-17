import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";

import TypCommon "../common/type";
import TypUser "type";

import UtlUser "util";
import UtlCommon "../common/util";
import UtlDate "../utils/date";
import Utl "../utils/helper";

module {
    private type BlockHashKey = Blob;

    // public type StableUsers         = (TypCommon.UserId, TypUser.UserProfile);
    // public type StableReferrerUsers = (Text, [TypCommon.UserId]);

    public type StableBlockchain    = (BlockHashKey, TypUser.UserBlock);
    public type StableUserIndex     = (TypCommon.UserId, [BlockHashKey]);
    public type StableUsernameIndex = (Text, TypCommon.UserId);
    public type StableReferralIndex = (Text, TypCommon.UserId);


    public class User(
        blockId           : TypCommon.BlockId,
        dataBlockchain    : [StableBlockchain],
        dataUserIndex     : [StableUserIndex],
        dataUsernameIndex : [StableUsernameIndex],
        dataReferralIndex : [StableReferralIndex],
    ) {
        public var blockCounter = blockId;

        public var blockchain    = HashMap.HashMap<BlockHashKey, TypUser.UserBlock>(dataBlockchain.size(), Blob.equal, Blob.hash);
        public var userIndex     = HashMap.HashMap<TypCommon.UserId, [BlockHashKey]>(dataUserIndex.size(), Principal.equal, Principal.hash);
        public var usernameIndex = HashMap.HashMap<Text, TypCommon.UserId>(dataUsernameIndex.size(), Text.equal, Text.hash);
        public var referralIndex = HashMap.HashMap<Text, TypCommon.UserId>(dataReferralIndex.size(), Text.equal, Text.hash);
        
        // MARK: Get previous hash

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

                        let recalculatedHash = UtlUser.calculateHash(currentBlock);
                        if (currentBlock.hash != recalculatedHash) return false;
                    };
                    case (_, _) { return false; };
                };

                currentIndex += 1;
            };

            return true;
        };

        // MARK: Get curr project state

        public func getCurrentUserState(userId: TypCommon.UserId): ?TypUser.UserProfile {
            switch (userIndex.get(userId)) {
                case (null)      { return null; };
                case (?blockIds) {
                    if (blockIds.size() == 0) return null;
                    
                    // Find the latest project data block (not team assignment)
                    var i = blockIds.size();
                    while (i > 0) {
                        i -= 1;
                        switch (blockchain.get(blockIds[i])) {
                            case (null)   { };
                            case (?block) { return ?block.data };
                        };
                    };

                    return null;
                };
            };
        };

        // MARK: Register

        public func register(
            caller : TypCommon.UserId, 
            req    : TypUser.UserRequest,
        ): TypUser.UserProfile {
            let personalRefCode = Utl.generateReferralCode(caller);
            let userProfile: TypUser.UserProfile = {
                id              = caller;
                userName        = req.userName;
                firstName       = req.firstName;
                lastName        = req.lastName;
                role            = req.role;
                tags            = req.tags;
                referrerCode    = req.referrerCode;
                personalRefCode = personalRefCode;
                plan_type       = #basic;
                action          = #registration;
            };

            var newBlock: TypUser.UserBlock = {
                id           = blockCounter;
                timestamp    = UtlDate.now();
                previousHash = getPreviousHash();
                data         = userProfile;
                hash         = "";
                signature    = Principal.toText(caller) # "_signature";
                nonce        = 0;
            };

            // Add to blockchain
            let blobBlockCounter = Utl.natToBlob(blockCounter);
            blockchain.put(blobBlockCounter, UtlUser.hashBlock(newBlock));
            
            // Update indices
            userIndex.put(caller, [blobBlockCounter]);
            usernameIndex.put(userProfile.userName, caller);
            referralIndex.put(personalRefCode, caller);

            blockCounter += 1;
            return userProfile;
        };

        // MARK: Save block

        public func saveBlock(caller : TypCommon.UserId, blockCounter : TypCommon.BlockId, block : TypUser.UserBlock) {
            // Add to blockchain
            let blobBlockCounter = Utl.natToBlob(blockCounter);
            blockchain.put(blobBlockCounter, UtlUser.hashBlock(block));

            Debug.print("Current user block: " # Nat.toText(blockCounter));
            
            // Update indices
            switch (userIndex.get(caller)) {
                case (?blocks) { 
                    Debug.print("Update user index");
                    userIndex.put(caller, Array.append(blocks, [blobBlockCounter])); 
                };
                case (null) {
                    Debug.print("User index: " # Nat.toText(blockCounter) # " not found");
                };
            };
        };

        // MARK: Authenticate

        public func authenticate(
            caller : TypCommon.UserId, 
            user   : TypUser.UserProfile,
            action : TypUser.AuthAction,
        ): TypUser.UserProfile {
            let userProfile: TypUser.UserProfile = {
                user with
                action = #authentication({
                    loginTime = UtlDate.now();
                    action    = action;
                })
            };

            var newBlock: TypUser.UserBlock = {
                id           = blockCounter;
                timestamp    = UtlDate.now();
                previousHash = getPreviousHash();
                data         = userProfile;
                hash         = "";
                signature    = Principal.toText(caller) # "_signature";
                nonce        = 0;
            };

            // Add to blockchain
            saveBlock(caller, blockCounter, newBlock);
            blockCounter += 1;

            return userProfile;
        };

        // MARK: Update profile

        public func updateProfile(
            caller : TypCommon.UserId, 
            user   : TypUser.UserProfile,
            req    : TypUser.UserRequest,
        ): TypUser.UserProfile {
            let dirtyFirstName = req.firstName != user.firstName;
            let dirtyLastName  = req.lastName != user.lastName;
            let dirtyRole      = user.role != req.role;

            let updatedState = if (dirtyFirstName or dirtyLastName) {{
                user with
                firstName = req.firstName;
                lastName  = req.lastName;
                action    = #updateName({
                    oldFirst = user.firstName;
                    newFirst = req.firstName;
                    oldLast  = user.lastName;
                    newLast  = req.lastName;
                });
            }} else if (dirtyRole) {{
                user with
                role   = req.role;
                action = #updateRole({
                    oldRole = user.role;
                    newRole = req.role;
                });
            }} else {
                user;
            };

            var newBlock: TypUser.UserBlock = {
                id           = blockCounter;
                timestamp    = UtlDate.now();
                previousHash = getPreviousHash();
                data         = updatedState;
                hash         = "";
                signature    = Principal.toText(caller) # "_signature";
                nonce        = 0;
            };

            // Add to blockchain
            saveBlock(caller, blockCounter, newBlock);
            blockCounter += 1;

            return updatedState;
        };

        // MARK: Update role

        public func updateRole(
            caller  : TypCommon.UserId, 
            user    : TypUser.UserProfile,
            reqRole : TypCommon.Role,
        ): TypUser.UserProfile {
            let userProfile: TypUser.UserProfile = {
                user with
                role   = reqRole;
                action = #updateRole({
                    oldRole = user.role;
                    newRole = reqRole;
                });
            };

            var newBlock: TypUser.UserBlock = {
                id           = blockCounter;
                timestamp    = UtlDate.now();
                previousHash = getPreviousHash();
                data         = userProfile;
                hash         = "";
                signature    = Principal.toText(caller) # "_signature";
                nonce        = 0;
            };

            // Add to blockchain
            saveBlock(caller, blockCounter, newBlock);
            blockCounter += 1;

            return userProfile;
        };

        // MARK: Update plan

        public func updatePlan(
            caller  : TypCommon.UserId, 
            user    : TypUser.UserProfile,
            reqPlan : TypUser.Plan,
        ): TypUser.UserProfile {
            let dirtyPlan = user.plan_type != reqPlan;
            let action = if (dirtyPlan) {
                #planUpgrade({
                    oldPlan = user.plan_type;
                    newPlan = reqPlan;
                });
            } else {
                user.action;
            };

            let userProfile: TypUser.UserProfile = {
                user with
                plan_type = if (dirtyPlan) reqPlan else user.plan_type;
                action    = action;
            };

            var newBlock: TypUser.UserBlock = {
                id           = blockCounter;
                timestamp    = UtlDate.now();
                previousHash = getPreviousHash();
                data         = userProfile;
                hash         = "";
                signature    = Principal.toText(caller) # "_signature";
                nonce        = 0;
            };

            // Add to blockchain
            saveBlock(caller, blockCounter, newBlock);
            blockCounter += 1;
            
            return userProfile;
        };
    }
}