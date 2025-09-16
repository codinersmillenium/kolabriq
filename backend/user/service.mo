import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Option "mo:base/Option";
import Nat "mo:base/Nat";
import Blob "mo:base/Blob";

import TypCommon "../common/type";
import TypUser "type";

import UtlUser "util";
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
        // public let users         = HashMap.HashMap<TypCommon.UserId, TypUser.UserProfile>(dataUsers.size(), Principal.equal, Principal.hash);
        // public let referrerUsers = HashMap.HashMap<Text, [TypCommon.UserId]>(dataReferrerUsers.size(), Text.equal, Text.hash);

        public var blockCounter   = blockId;

        public var blockchain    = HashMap.HashMap<BlockHashKey, TypUser.UserBlock>(dataBlockchain.size(), Blob.equal, Blob.hash);
        public var userIndex     = HashMap.HashMap<TypCommon.UserId, [BlockHashKey]>(dataUserIndex.size(), Principal.equal, Principal.hash);
        public var usernameIndex = HashMap.HashMap<Text, TypCommon.UserId>(dataUsernameIndex.size(), Text.equal, Text.hash);
        public var referralIndex = HashMap.HashMap<Text, TypCommon.UserId>(dataReferralIndex.size(), Text.equal, Text.hash);
        
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
            let personalRefCode = "Utl.generateReferralCode()";
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

        // MARK: Authenticote

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
            let blobBlockCounter = Utl.natToBlob(blockCounter);
            blockchain.put(blobBlockCounter, UtlUser.hashBlock(newBlock));
            
            // Update indices
            switch (userIndex.get(caller)) {
                case (?blocks) { userIndex.put(caller, Array.append(blocks, [blobBlockCounter])); };
                case (null)    { };
            };

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

            let action = if (dirtyFirstName or dirtyLastName) {
                #updateName({
                    oldFirst = user.firstName;
                    newFirst = req.firstName;
                    oldLast  = user.lastName;
                    newLast  = req.lastName;
                });
            } else if (dirtyRole) {
                #updateRole({
                    oldRole = user.role;
                    newRole = req.role;
                });
            } else {
                user.action;
            };

            let userProfile: TypUser.UserProfile = {
                user with
                firstName = if (dirtyFirstName) req.firstName else user.firstName;
                lastName  = if (dirtyLastName) req.lastName else user.lastName;
                role      = if (dirtyRole) req.role else user.role;
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
            let blobBlockCounter = Utl.natToBlob(blockCounter);
            blockchain.put(blobBlockCounter, UtlUser.hashBlock(newBlock));
            
            // Update indices
            switch (userIndex.get(caller)) {
                case (?blocks) { userIndex.put(caller, Array.append(blocks, [blobBlockCounter])); };
                case (null)    { };
            };

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
            let blobBlockCounter = Utl.natToBlob(blockCounter);
            blockchain.put(blobBlockCounter, UtlUser.hashBlock(newBlock));
            
            // Update indices
            switch (userIndex.get(caller)) {
                case (?blocks) { userIndex.put(caller, Array.append(blocks, [blobBlockCounter])); };
                case (null)    { };
            };

            blockCounter += 1;
            return userProfile;
        };

        // // MARK: Get user ref code
        // private func getUserRefCode(userId : TypCommon.UserId) : Text {
        //     switch(users.get(userId)) {
        //         case(null)  { return ""; };
        //         case(?user) {
        //             let refCode      = Option.get<Text>(user.referrerCode, "");
        //             let personalCode = Option.get<Text>(user.personalRefCode, "");

        //             return if (personalCode != "") {
        //                 personalCode;
        //             } else if (refCode != "") {
        //                 refCode;
        //             } else {
        //                 "";
        //             };
        //         };
        //     };
        // };

        // // MARK: Get user by ids
        // public func getUsersByIds(userIds : [TypCommon.UserId]) : [TypUser.UserProfile] {
        //     let result = Buffer.Buffer<TypUser.UserProfile>(userIds.size());
        //     for (userId in userIds.vals()) {
        //         switch(users.get(userId)) {
        //             case(null)  {};
        //             case(?user) { result.add(user); };
        //         };
        //     };
        //     return Buffer.toArray(result);
        // };

        // // MARK: Get users
        // public func getUsers(userId : TypCommon.UserId) : [TypUser.UserProfile] {
        //     let refCode = getUserRefCode(userId);
        //     if (refCode == "") return [];

        //     switch(referrerUsers.get(refCode)) {
        //         case(null) { return [] };
        //         case(?usersId) {
        //             let dataUsers = getUsersByIds(usersId);
        //             let result    = Buffer.Buffer<TypUser.UserProfile>(0);
                    
        //             for(user in dataUsers.vals()) {
        //                 result.add(user);
        //             };

        //             return Buffer.toArray(result);
        //         };
        //     };
        // };

        // // MARK: Get filtered users
        // public func getFilteredUsers(
        //     userId : TypCommon.UserId,
        //     filter : TypUser.UserProfileFilter,
        // ) : [TypUser.UserProfile] {
        //     let refCode = getUserRefCode(userId);
        //     if (refCode == "") return [];

        //     switch(referrerUsers.get(refCode)) {
        //         case(null) { return [] };
        //         case(?usersId) {
        //             let dataUsers = getUsersByIds(usersId);
        //             let result    = Buffer.Buffer<TypUser.UserProfile>(0);
                    
        //             label loopUser for(user in dataUsers.vals()) {
        //                 let inRole = Array.find<TypCommon.Role>(
        //                     filter.roles, 
        //                     func(role) = role == user.role
        //                 ) != null;

        //                 if (not inRole) {
        //                     continue loopUser;
        //                 };

        //                 if (Utl.hasAnyTag(filter.tags, user.tags)) {
        //                     result.add(user);
        //                 };
        //             };

        //             return Buffer.toArray(result);
        //         };
        //     };
        // };

        // // MARK: Create user
        // public func createUser(
        //     userId       : TypCommon.UserId, 
        //     req          : TypUser.UserProfileRequest,
        //     personalCode : ?Text,
        // ) : TypUser.UserProfile {
        //     let data : TypUser.UserProfile = {
        //         id              = userId;
        //         userName        = req.userName;
        //         firstName       = req.firstName;
        //         lastName        = req.lastName;
        //         role            = req.role;
        //         tags            = req.tags;
        //         referrerCode    = req.referrerCode;
        //         personalRefCode = personalCode;
        //         plan_type       = #basic;
        //         plan_expired_at = null;
        //         createdAt       = UtlDate.now();
        //         createdById     = userId;
        //         updatedAt       = null;
        //         updatedById     = null;
        //     };

        //     users.put(data.id, data);
            
        //     if (req.role == #admin or req.referrerCode != null) {
        //         let refCode : Text = if (req.role == #admin) {
        //             Option.get(personalCode, "");
        //         } else {
        //             Option.get(req.referrerCode, "")
        //         };
                
        //         referrerUsers.put(
        //             refCode,
        //             switch(referrerUsers.get(refCode)) {
        //                 case (null) { [data.id]; };
        //                 case (?usersId) { Array.append<TypCommon.UserId>(usersId, [data.id]); };
        //             }
        //         );
        //     };

        //     return data;
        // };

        // // MARK: Find user by id
        // public func findUserById(id : TypCommon.UserId) : ?TypUser.UserProfile {
        //     switch (users.get(id)) {
        //         case (null)  { return null; };
        //         case (?user) {
        //             let data : TypUser.UserProfile = {
        //                 id 		        = user.id;
        //                 userName        = user.userName;
        //                 firstName       = user.firstName;
        //                 lastName        = user.lastName;
        //                 role 	        = user.role;
        //                 tags 	        = user.tags;
        //                 referrerCode    = user.referrerCode;
        //                 personalRefCode = user.personalRefCode;
        //                 plan_type       = user.plan_type;
        //                 plan_expired_at = user.plan_expired_at;
        //                 createdAt       = user.createdAt;
        //                 createdById     = user.createdById;
        //                 updatedAt       = user.updatedAt;
        //                 updatedById     = user.updatedById;
        //             };

        //             return ?data;
        //         };
        //     };
        // };

        // // MARK: Update user
        // private func bindUser(
        //     original: TypUser.UserProfile,
        //     updates: {
        //         userName : ?Text;
        //         firstName : ?Text;
        //         lastName : ?Text;
        //         role : ?TypCommon.Role;
        //         tags : ?[TypCommon.Tags];
        //         updatedById : ?TypCommon.UserId;
        //     }
        // ) : TypUser.UserProfile {
        //     {
        //         id              = original.id;
        //         userName        = Option.get<Text>(updates.userName, original.userName);
        //         firstName       = Option.get<Text>(updates.firstName, original.firstName);
        //         lastName        = Option.get<Text>(updates.lastName, original.lastName);
        //         role            = Option.get<TypCommon.Role>(updates.role, original.role);
        //         tags            = Option.get<[TypCommon.Tags]>(updates.tags, original.tags);
        //         referrerCode    = original.referrerCode;
        //         personalRefCode = original.personalRefCode;
        //         plan_type       = original.plan_type;
        //         plan_expired_at = original.plan_expired_at;
        //         createdAt       = original.createdAt;
        //         createdById     = original.createdById;
        //         updatedAt       = ?UtlDate.now();
        //         updatedById     = updates.updatedById;
        //     };
        // };

        // public func updateUser(
        //     userId : TypCommon.UserId,
        //     user   : TypUser.UserProfile, 
        //     req    : TypUser.UserProfileRequest
        // ) : TypUser.UserProfile {
        //     let data = bindUser(user, {
        //         userName    = ?req.userName;
        //         firstName   = ?req.firstName;
        //         lastName    = ?req.lastName;
        //         role        = ?req.role;
        //         tags        = ?req.tags;
        //         updatedById = ?userId;
        //     });

        //     users.put(data.id, data);
        //     return data;
        // };

        // // MARK assign role to simple method (developer or maintenance)
        // public func assignRole(
        //     userId : TypCommon.UserId,
        //     user   : TypUser.UserProfile, 
        //     role   : TypCommon.Role
        // ) : TypUser.UserProfile {
        //     let data = bindUser(user, {
        //         userName    = null;
        //         firstName   = null;
        //         lastName    = null;
        //         role        = ?role;
        //         tags        = null;
        //         updatedById = ?userId;
        //     });

        //     users.put(data.id, data);
        //     return data;
        // };

        // // MARK: Mapped to data response
        // public func mappedToResponse(user  : TypUser.UserProfile) : TypUser.UserProfileResponse {
        //     let data : TypUser.UserProfileResponse = {
        //         id              = user.id;
        //         userName        = user.userName;
        //         firstName       = user.firstName;
        //         lastName        = user.lastName;
        //         role            = user.role;
        //         tags            = user.tags;
        //         referrerCode    = user.referrerCode;
        //         personalRefCode = user.personalRefCode;
        //         plan_type       = user.plan_type;
        //         plan_expired_at = user.plan_expired_at;
        //         createdAt       = user.createdAt;
        //     };

        //     return data;
        // };

        // // MARK: Update user plan
        // public func updateUserPlan(user : TypUser.UserProfile) : TypUser.UserProfile {
        //     if (user.plan_type == #basic) return user;

        //     let isPlanExpired = Option.get<Int>(user.plan_expired_at, 0) < UtlDate.now();
        //     let (updatedPlan : TypUser.PLan, updatedExpired : ?Int) = if (isPlanExpired) {
        //         (#basic, null)
        //     } else {
        //         (user.plan_type, user.plan_expired_at)
        //     };

        //     let data : TypUser.UserProfile = {
        //         id 		        = user.id;
        //         userName        = user.userName;
        //         firstName       = user.firstName;
        //         lastName        = user.lastName;
        //         role 	        = user.role;
        //         tags 	        = user.tags;
        //         referrerCode    = user.referrerCode;
        //         personalRefCode = user.personalRefCode;
        //         plan_type       = updatedPlan;
        //         plan_expired_at = updatedExpired;
        //         createdAt       = user.createdAt;
        //         createdById     = user.createdById;
        //         updatedAt       = user.updatedAt;
        //         updatedById     = user.updatedById;
        //     };

        //     users.put(data.id, data);

        //     return data;
        // };

        // // MARK: Renew user plan
        // public func renewUserPlan(
        //     userId : TypCommon.UserId,
        //     user   : TypUser.UserProfile, 
        //     req    : TypUser.PLanRequest,
        // ) : TypUser.UserProfile {
        //     let curr_expired_at = Option.get<Int>(user.plan_expired_at, 0);
        //     let (plan : TypUser.PLan, expired : ?Int) = switch(req) {
        //         case(#basic)   { (#basic, null); };
        //         case(#monthly) { (#pro, ?(curr_expired_at + UtlDate.oneMonth())); };
        //         case(#yearly)  { (#pro, ?(curr_expired_at + UtlDate.oneYear())); };
        //     };

        //     let data : TypUser.UserProfile = {
        //         id 		        = user.id;
        //         userName        = user.userName;
        //         firstName       = user.firstName;
        //         lastName        = user.lastName;
        //         role 	        = user.role;
        //         tags 	        = user.tags;
        //         referrerCode    = user.referrerCode;
        //         personalRefCode = user.personalRefCode;
        //         plan_type       = plan;
        //         plan_expired_at = expired;
        //         createdAt       = user.createdAt;
        //         createdById     = user.createdById;
        //         updatedAt       = ?UtlDate.now();
        //         updatedById     = ?userId;
        //     };

        //     users.put(data.id, data);

        //     return data;
        // };
    }
}