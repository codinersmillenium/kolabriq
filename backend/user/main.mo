import types "types";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Iter "mo:base/Iter";

actor {

    stable var usersState: [types.User] = [];
    let users = HashMap.HashMap<Principal, types.User>(10, Principal.equal, Principal.hash);

    system func preupgrade() {
        usersState := Iter.toArray(users.vals());
    };
    system func postupgrade() {
        for (user in usersState.vals()) {
            users.put(user.id, user);
        };
    };

    public shared ({caller}) func registerUser(role: types.Role) : async Result.Result<types.User, Text> {
        if (users.get(caller) != null) {
            return #err("User sudah terdaftar");
        };

        let newUser : types.User = {
            id = caller;
            role = role;
        };

        users.put(caller, newUser);
        return #ok(newUser);
    };

    public shared query ({caller}) func getUser() : async ?types.User {
        return users.get(caller);
    };

};
