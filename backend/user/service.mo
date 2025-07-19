import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";

import TypCommon "../common/type";
import TypUser "type";

import UtlDate "../utils/date";
import Utl "../utils/helper";

module {
    public type StableUser = (TypCommon.UserId, TypUser.User);

    public class User(dataUsers : [StableUser]) {
        public let users = HashMap.HashMap<TypCommon.UserId, TypUser.User>(dataUsers.size(), Principal.equal, Principal.hash);

        public func getUsersByIds(ids : [TypCommon.UserId]) : [TypUser.User] {
            let data = Buffer.Buffer<TypUser.User>(ids.size());
            for (user in users.vals()) {
                let found = Array.find<TypCommon.UserId>(
                    ids, 
                    func(id) = id == user.id
                ) != null;

                if (found) {
                    data.add(user);
                };
            };
            return Buffer.toArray(data);
        };

        public func getUsersByFilter(filter : TypUser.UserFilter) : [TypUser.User] {
            let data = Buffer.Buffer<TypUser.User>(0);
            label loopUser for (user in users.vals()) {
                let inRole = Array.find<TypUser.Role>(
                    filter.roles, 
                    func(role) = role == user.role
                ) != null;

                if (not inRole) {
                    continue loopUser;
                };

                if (Utl.hasAnyTag(filter.tags, user.tags)) {
                    data.add(user);
                };
            };
            return Buffer.toArray(data);
        };

        public func createUser(id : TypCommon.UserId, req : TypUser.UserRequest) : TypUser.User {
            let data : TypUser.User = {
                id          = id;
                userName    = req.userName;
                firstName   = req.firstName;
                lastName    = req.lastName;
                role        = req.role;
                tags        = req.tags;
                createdAt   = UtlDate.now();
                createdById = id;
                updatedAt   = null;
                updatedById = null;
            };

            putUser(data);
            return data;
        };

        public func putUser(user : TypUser.User) {
            users.put(user.id, user);
        };

        public func findUserById(id : TypCommon.UserId) : ?TypUser.User {
            return switch (users.get(id)) {
                case (null)  { return null; };
                case (?user) {
                    let data : TypUser.User = {
                        id 		    = user.id;
                        userName    = user.userName;
                        firstName   = user.firstName;
                        lastName    = user.lastName;
                        role 	    = user.role;
                        tags 	    = user.tags;
                        createdAt   = user.createdAt;
                        createdById = user.createdById;
                        updatedAt   = user.updatedAt;
                        updatedById = user.updatedById;
                    };
                    return ?data;
                };
            };
        };

        public func updateUser(
            userId : TypCommon.UserId,
            user   : TypUser.User, 
            req    : TypUser.UserRequest,
        ) : TypUser.User {
            let data : TypUser.User = {
                id 		    = user.id;
                userName    = req.userName;
                firstName   = req.firstName;
                lastName    = req.lastName;
                role 	    = req.role;
                tags 	    = req.tags;
                createdAt   = user.createdAt;
                createdById = user.createdById;
                updatedAt   = ?UtlDate.now();
                updatedById = ?userId;
            };

            putUser(data);
            return data;
        };

        public func mappedToResponse(
            user  : TypUser.User,
        ) : TypUser.UserResponse {
            let data : TypUser.UserResponse = {
                id        = user.id;
                userName  = user.userName;
                firstName = user.firstName;
                lastName  = user.lastName;
                role      = user.role;
                tags      = user.tags;
                createdAt = user.createdAt;
            };

            return data;
        };
    }
}