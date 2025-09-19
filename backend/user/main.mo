import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Option "mo:base/Option";
import Nat "mo:base/Nat";
import HashMap "mo:base/HashMap";
import Blob "mo:base/Blob";
import Principal "mo:base/Principal";

import TypCommon "../common/type";
import TypUser "type";

import SvcUser "service";

import UtlCommon "../common/util";
import Utl "../utils/helper";


persistent actor {
    private var nextBlockCounter : TypCommon.BlockId = 0;

    private var stableBlockchain    : [SvcUser.StableBlockchain]    = [];
    private var stableUserIndex     : [SvcUser.StableUserIndex]     = [];
    private var stableUsernameIndex : [SvcUser.StableUsernameIndex] = [];
    private var stableReferralIndex : [SvcUser.StableReferralIndex] = [];

    transient let user = SvcUser.User(
        nextBlockCounter, 
        stableBlockchain,
        stableUserIndex,
        stableUsernameIndex,
        stableReferralIndex,
    );

    // MARK: System

    system func preupgrade() {
        // Save all HashMap data to stable variables
        stableBlockchain    := Iter.toArray(user.blockchain.entries());
        stableUserIndex     := Iter.toArray(user.userIndex.entries());
        stableUsernameIndex := Iter.toArray(user.usernameIndex.entries());
        stableReferralIndex := Iter.toArray(user.referralIndex.entries());
    };

    system func postupgrade() {
        // Restore data from stable variables to HashMaps
        user.blockchain := HashMap.fromIter<Blob, TypUser.UserBlock>(
            stableBlockchain.vals(), 
            stableBlockchain.size(), 
            Blob.equal, 
            Blob.hash
        );
        
        user.userIndex := HashMap.fromIter<TypCommon.UserId, [Blob]>(
            stableUserIndex.vals(),
            stableUserIndex.size(),
            Principal.equal,
            Principal.hash
        );
        
        user.usernameIndex := HashMap.fromIter<Text, TypCommon.UserId>(
            stableUsernameIndex.vals(),
            stableUsernameIndex.size(),
            Text.equal,
            Text.hash
        );
        
        user.referralIndex := HashMap.fromIter<Text, TypCommon.UserId>(
            stableReferralIndex.vals(),
            stableReferralIndex.size(),
            Text.equal,
            Text.hash
        );
        
        // Clear stable variables to free memory (after restoration)
        stableBlockchain    := [];
        stableUserIndex     := [];
        stableUsernameIndex := [];
        stableReferralIndex := [];
    };

    // MARK: Register
    public shared ({caller}) func registerUser(
        req : TypUser.UserRequest
    ) : async Result.Result<TypUser.UserProfile, Text> {
        if (not user.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };

        return #ok(user.register(caller, req));
    };

    // MARK: Login
    
    public shared ({caller}) func login() : async Result.Result<TypUser.UserProfile, Text> {
        if (not user.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };

        switch(user.getCurrentUserState(caller)) {
            case(null)  { #err("Login failed: invalid icp identity"); };
            case(?data) { #ok(user.authenticate(caller, data, #login));  };
        };
    };

    // MARK: Logout
    
    public shared ({caller}) func logout() : async Result.Result<TypUser.UserProfile, Text> {
        if (not user.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };

        switch(user.getCurrentUserState(caller)) {
            case(null)  { #err("Logout failed: invalid icp identity"); };
            case(?data) { #ok(user.authenticate(caller, data, #logout));  };
        };
    };

    // MARK: Get user list

    public shared query func getUserList(
        filter : TypUser.UserFilter
    ) : async Result.Result<[TypUser.UserProfile], ()> {
        var results: [TypUser.UserProfile] = [];
        for ((userId, blockIds) in user.userIndex.entries()) {
            switch (user.getCurrentUserState(userId)) {
                case (null)  { };
                case (?data) {
                    var matches = true;
                    
                    // Role filter
                    switch (filter.roles) {
                        case (null)   { };
                        case (?roles) {
                            if (roles.size() > 0) {
                                let roleCheck = Array.find<TypCommon.Role>(roles, func r = r == data.role);
                                matches := matches and Option.isSome(roleCheck);
                            };
                        };
                    };
                    
                    // Tags filter
                    switch (filter.tags) {
                        case (null)  { };
                        case (?tags) {
                            if (tags.size() > 0) {
                                matches := matches and Utl.hasAnyTag(data.tags, tags);
                            };
                        };
                    };
                    
                    // Keyword filter
                    switch (filter.keyword) {
                        case (null)     { };
                        case (?keyword) {
                            if (keyword != "") {
                                let lowerKeyword    = Text.toLowercase(keyword);
                                let matchesName     = Text.contains(Text.toLowercase(data.firstName # " " # data.lastName), #text lowerKeyword);
                                let matchesUsername = Text.contains(Text.toLowercase(data.userName), #text lowerKeyword);
                                matches := matches and (matchesName or matchesUsername);
                            };
                        };
                    };
                    
                    if (matches) {
                        results := Array.append(results, [data]);
                    };
                };
            };
        };
        
        return #ok(results);
    };

    // MARK: Get users by ids

    public query func getUsersByIds(
        userIds : [TypCommon.UserId]
    ) : async Result.Result<[TypUser.UserProfile], Text> {
        var results: [TypUser.UserProfile] = [];
        for(userId in userIds.vals()) {
            switch (user.getCurrentUserState(userId)) {
                case (null)  { };
                case (?data) { results := Array.append(results, [data]) };
            };
        };

        return #ok(results);
    };

    // MARK: Get user detail

    public query func getUserDetail(
        userId : TypCommon.UserId,
    ) : async Result.Result<TypUser.UserProfile, Text>  {
        switch(user.getCurrentUserState(userId)) {
            case(null)  { #err("Invalid icp identity"); };
            case(?data) { return #ok(data); };
        };
    };

    // MARK: Update user
    
    public shared ({caller}) func updateUser(
        req : TypUser.UserRequest,
    ) : async Result.Result<TypUser.UserProfile, Text> {
        if (not user.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };

        switch(user.getCurrentUserState(caller)) {
            case(null)  { #err("Invalid icp identity"); };
            case(?data) { #ok(user.updateProfile(caller, data, req)); };
        };
    };

    // MARK: Update role

    public shared ({caller}) func updateRole(
        userId  : TypCommon.UserId,
        reqRole : TypCommon.Role,
    ) : async Result.Result<TypUser.UserProfile, Text> {
        if (not user.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };

        if (reqRole == #admin) {
            return #err("Access denied");
        };

        return switch(user.getCurrentUserState(userId)) {
            case(null)  { #err("Invalid icp identity"); };
            case(?data) { #ok(user.updateRole(caller, data, reqRole)); };
        };
    };

    // MARK: Update plan

    public shared ({caller}) func upgradePlan(
        req : TypUser.Plan,
    ) : async Result.Result<TypUser.UserProfile, Text> {
        if (not user.verifyChainIntegrity()) {
            return #err("Blockchain integrity compromised");
        };

        switch(user.getCurrentUserState(caller)) {
            case(null)  { #err("Invalid icp identity"); };
            case(?data) { #ok(user.updatePlan(caller, data, req)); };
        };
    };

    // MARK: Get user history

    public query func getUserHistory(
        userId : TypCommon.UserId,
    ) : async Result.Result<[TypUser.UserBlock], Text> {
        switch (user.userIndex.get(userId)) {
            case (null)      { #err("Invalid icp identity"); };
            case (?blockIds) {
                let blocks = Array.mapFilter<Blob, TypUser.UserBlock>(
                    blockIds,
                    func blockId = user.blockchain.get(blockId)
                );

                return #ok(blocks);
            };
        };
    };

    // MARK: Health

    public query func healthCheck(): async {
        totalBlocks    : Nat;
        chainIntegrity : Bool;
        lastBlockHash  : Text;
        totalUsers     : Nat;
    } {
        let integrity    = user.verifyChainIntegrity();
        let blockCounter = user.blockCounter;
        let lastHash     = if (blockCounter > 0) {
            let prevBlockKey = Nat.sub(blockCounter, 1);
            switch (user.blockchain.get(Utl.natToBlob(prevBlockKey))) {
                case (null)   { "No blocks" };
                case (?block) { block.hash };
            };
        } else {
            UtlCommon.GENESIS_HASH;
        };
        
        return {
            totalBlocks    = blockCounter;
            chainIntegrity = integrity;
            lastBlockHash  = lastHash;
            totalUsers     = user.userIndex.size();
        };
    };

    // MARK: Cek principal
    public shared query ({caller}) func checkPrincipal() : async Principal {
        return caller;
    };
};
