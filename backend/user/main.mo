import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Array "mo:base/Array";

import TypCommon "../common/type";
import TypUser "type";

import SvcUser "service";

actor {
    private stable var stableUser : [SvcUser.StableUser] = [];

    private let users = SvcUser.User(stableUser);

    public shared func getUsersByIds(
        ids : [TypCommon.UserId]
    ) : async Result.Result<[TypUser.UserResponse], ()> {
        if (ids.size() == 0) return #ok([]);

        let data = Array.map<TypUser.User, TypUser.UserResponse>(
            users.getUsersByIds(ids), 
            func user = users.mappedToResponse(user),
        );

        return #ok(data);
    };

    public shared func getUsersByFilter(
        filter : TypUser.UserFilter
    ) : async Result.Result<[TypUser.UserResponse], ()> {
        let data = Array.map<TypUser.User, TypUser.UserResponse>(
            users.getUsersByFilter(filter), 
            func user = users.mappedToResponse(user),
        );

        return #ok(data);
    };

    public shared ({caller}) func registerUser(
        req : TypUser.UserRequest
    ) : async Result.Result<TypUser.UserResponse, Text> {
        return switch(users.users.get(caller)) {
            case(?user) { #err("Akun [" # req.firstName # " ] sudah terdaftar."); };
            case(null)  { 
                let data = users.createUser(caller, req);
                #ok(users.mappedToResponse(data)); 
            };
        };
    };

    public shared func findUserById(
        userId : TypCommon.UserId
    ) : async Result.Result<TypUser.UserResponse, Text> {
        return switch(users.findUserById(userId)) {
            case(null)  { #err("Akun tidak ditemukan."); };
            case(?user) { #ok(users.mappedToResponse(user)); };
        };
    };

    public shared ({caller}) func updateUser(
        userId : TypCommon.UserId, 
        req    : TypUser.UserRequest,
    ) : async Result.Result<TypUser.UserResponse, Text> {
        return switch(users.findUserById(userId)) {
            case(null)  { #err("Akun tidak ditemukan."); };
            case(?user) { 
                let data = users.updateUser(caller, user, req);
                #ok(users.mappedToResponse(data)); 
            };
        };
    };

    system func preupgrade() {
        stableUser := Iter.toArray(users.users.entries());
    };
    system func postupgrade() {
        stableUser := [];
    };
};
