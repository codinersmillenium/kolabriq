import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Option "mo:base/Option";

import TypCommon "../common/type";
import TypUser "type";

import UtlDate "../utils/date";
import Utl "../utils/helper";

module {
    public type StableUsers         = (TypCommon.UserId, TypUser.User);
    public type StableReferrerUsers = (Text, [TypCommon.UserId]);

    public class User(
        dataUsers         : [StableUsers],
        dataReferrerUsers : [StableReferrerUsers],
    ) {
        public let users         = HashMap.HashMap<TypCommon.UserId, TypUser.User>(dataUsers.size(), Principal.equal, Principal.hash);
        public let referrerUsers = HashMap.HashMap<Text, [TypCommon.UserId]>(dataReferrerUsers.size(), Text.equal, Text.hash);

        // MARK: Get user ref code
        private func getUserRefCode(userId : TypCommon.UserId) : Text {
            switch(users.get(userId)) {
                case(null)  { return ""; };
                case(?user) {
                    let refCode      = Option.get<Text>(user.referrerCode, "");
                    let personalCode = Option.get<Text>(user.personalRefCode, "");

                    return if (personalCode != "") {
                        personalCode;
                    } else if (refCode != "") {
                        refCode;
                    } else {
                        "";
                    };
                };
            };
        };

        // MARK: Get user by ids
        public func getUsersByIds(userIds : [TypCommon.UserId]) : [TypUser.User] {
            let result = Buffer.Buffer<TypUser.User>(userIds.size());
            for (userId in userIds.vals()) {
                switch(users.get(userId)) {
                    case(null)  {};
                    case(?user) { result.add(user); };
                };
            };
            return Buffer.toArray(result);
        };

        // MARK: Get users
        public func getUsers(userId : TypCommon.UserId) : [TypUser.User] {
            let refCode = getUserRefCode(userId);
            if (refCode == "") return [];

            switch(referrerUsers.get(refCode)) {
                case(null) { return [] };
                case(?usersId) {
                    let dataUsers = getUsersByIds(usersId);
                    let result    = Buffer.Buffer<TypUser.User>(0);
                    
                    for(user in dataUsers.vals()) {
                        result.add(user);
                    };

                    return Buffer.toArray(result);
                };
            };
        };

        // MARK: Get filtered users
        public func getFilteredUsers(
            userId : TypCommon.UserId,
            filter : TypUser.UserFilter,
        ) : [TypUser.User] {
            let refCode = getUserRefCode(userId);
            if (refCode == "") return [];

            switch(referrerUsers.get(refCode)) {
                case(null) { return [] };
                case(?usersId) {
                    let dataUsers = getUsersByIds(usersId);
                    let result    = Buffer.Buffer<TypUser.User>(0);
                    
                    label loopUser for(user in dataUsers.vals()) {
                        let inRole = Array.find<TypUser.Role>(
                            filter.roles, 
                            func(role) = role == user.role
                        ) != null;

                        if (not inRole) {
                            continue loopUser;
                        };

                        if (Utl.hasAnyTag(filter.tags, user.tags)) {
                            result.add(user);
                        };
                    };

                    return Buffer.toArray(result);
                };
            };
        };

        // MARK: Create user
        public func createUser(
            userId       : TypCommon.UserId, 
            req          : TypUser.UserRequest,
            personalCode : ?Text,
        ) : TypUser.User {
            let data : TypUser.User = {
                id              = userId;
                userName        = req.userName;
                firstName       = req.firstName;
                lastName        = req.lastName;
                role            = req.role;
                tags            = req.tags;
                referrerCode    = req.referrerCode;
                personalRefCode = personalCode;
                plan_type       = #basic;
                plan_expired_at = null;
                createdAt       = UtlDate.now();
                createdById     = userId;
                updatedAt       = null;
                updatedById     = null;
            };

            users.put(data.id, data);
            
            if (req.role == #admin or req.referrerCode != null) {
                let refCode : Text = if (req.role == #admin) {
                    Option.get(personalCode, "");
                } else {
                    Option.get(req.referrerCode, "")
                };
                
                referrerUsers.put(
                    refCode,
                    switch(referrerUsers.get(refCode)) {
                        case (null) { [data.id]; };
                        case (?usersId) { Array.append<TypCommon.UserId>(usersId, [data.id]); };
                    }
                );
            };

            return data;
        };

        // MARK: Find user by id
        public func findUserById(id : TypCommon.UserId) : ?TypUser.User {
            switch (users.get(id)) {
                case (null)  { return null; };
                case (?user) {
                    let data : TypUser.User = {
                        id 		        = user.id;
                        userName        = user.userName;
                        firstName       = user.firstName;
                        lastName        = user.lastName;
                        role 	        = user.role;
                        tags 	        = user.tags;
                        referrerCode    = user.referrerCode;
                        personalRefCode = user.personalRefCode;
                        plan_type       = user.plan_type;
                        plan_expired_at = user.plan_expired_at;
                        createdAt       = user.createdAt;
                        createdById     = user.createdById;
                        updatedAt       = user.updatedAt;
                        updatedById     = user.updatedById;
                    };

                    return ?data;
                };
            };
        };

        // MARK: Update user
        private func bindUser(
            original: TypUser.User,
            updates: {
                userName : ?Text;
                firstName : ?Text;
                lastName : ?Text;
                role : ?TypUser.Role;
                tags : ?[TypCommon.Tags];
                updatedById : ?TypCommon.UserId;
            }
        ) : TypUser.User {
            {
                id              = original.id;
                userName        = Option.get<Text>(updates.userName, original.userName);
                firstName       = Option.get<Text>(updates.firstName, original.firstName);
                lastName        = Option.get<Text>(updates.lastName, original.lastName);
                role            = Option.get<TypUser.Role>(updates.role, original.role);
                tags            = Option.get<[TypCommon.Tags]>(updates.tags, original.tags);
                referrerCode    = original.referrerCode;
                personalRefCode = original.personalRefCode;
                plan_type       = original.plan_type;
                plan_expired_at = original.plan_expired_at;
                createdAt       = original.createdAt;
                createdById     = original.createdById;
                updatedAt       = ?UtlDate.now();
                updatedById     = updates.updatedById;
            };
        };

        public func updateUser(
            userId : TypCommon.UserId,
            user   : TypUser.User, 
            req    : TypUser.UserRequest
        ) : TypUser.User {
            let data = bindUser(user, {
                userName    = ?req.userName;
                firstName   = ?req.firstName;
                lastName    = ?req.lastName;
                role        = ?req.role;
                tags        = ?req.tags;
                updatedById = ?userId;
            });

            users.put(data.id, data);
            return data;
        };

        // MARK assign role to simple method (developer or maintenance)
        public func assignRole(
            userId : TypCommon.UserId,
            user   : TypUser.User, 
            role   : TypUser.Role
        ) : TypUser.User {
            let data = bindUser(user, {
                userName    = null;
                firstName   = null;
                lastName    = null;
                role        = ?role;
                tags        = null;
                updatedById = ?userId;
            });

            users.put(data.id, data);
            return data;
        };

        // MARK: Mapped to data response
        public func mappedToResponse(user  : TypUser.User) : TypUser.UserResponse {
            let data : TypUser.UserResponse = {
                id              = user.id;
                userName        = user.userName;
                firstName       = user.firstName;
                lastName        = user.lastName;
                role            = user.role;
                tags            = user.tags;
                referrerCode    = user.referrerCode;
                personalRefCode = user.personalRefCode;
                plan_type       = user.plan_type;
                plan_expired_at = user.plan_expired_at;
                createdAt       = user.createdAt;
            };

            return data;
        };

        // MARK: Update user plan
        public func updateUserPlan(user : TypUser.User) : TypUser.User {
            if (user.plan_type == #basic) return user;

            let isPlanExpired = Option.get<Int>(user.plan_expired_at, 0) < UtlDate.now();
            let (updatedPlan : TypUser.PLan, updatedExpired : ?Int) = if (isPlanExpired) {
                (#basic, null)
            } else {
                (user.plan_type, user.plan_expired_at)
            };

            let data : TypUser.User = {
                id 		        = user.id;
                userName        = user.userName;
                firstName       = user.firstName;
                lastName        = user.lastName;
                role 	        = user.role;
                tags 	        = user.tags;
                referrerCode    = user.referrerCode;
                personalRefCode = user.personalRefCode;
                plan_type       = updatedPlan;
                plan_expired_at = updatedExpired;
                createdAt       = user.createdAt;
                createdById     = user.createdById;
                updatedAt       = user.updatedAt;
                updatedById     = user.updatedById;
            };

            users.put(data.id, data);

            return data;
        };

        // MARK: Renew user plan
        public func renewUserPlan(
            userId : TypCommon.UserId,
            user   : TypUser.User, 
            req    : TypUser.PLanRequest,
        ) : TypUser.User {
            let curr_expired_at = Option.get<Int>(user.plan_expired_at, 0);
            let (plan : TypUser.PLan, expired : ?Int) = switch(req) {
                case(#basic)   { (#basic, null); };
                case(#monthly) { (#pro, ?(curr_expired_at + UtlDate.oneMonth())); };
                case(#yearly)  { (#pro, ?(curr_expired_at + UtlDate.oneYear())); };
            };

            let data : TypUser.User = {
                id 		        = user.id;
                userName        = user.userName;
                firstName       = user.firstName;
                lastName        = user.lastName;
                role 	        = user.role;
                tags 	        = user.tags;
                referrerCode    = user.referrerCode;
                personalRefCode = user.personalRefCode;
                plan_type       = plan;
                plan_expired_at = expired;
                createdAt       = user.createdAt;
                createdById     = user.createdById;
                updatedAt       = ?UtlDate.now();
                updatedById     = ?userId;
            };

            users.put(data.id, data);

            return data;
        };
    }
}