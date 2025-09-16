import Principal "mo:base/Principal";
import Int "mo:base/Int";
import Nat "mo:base/Nat";

import TypUser "type";
import TypCommon "../common/type";

import UtlSha256 "../utils/sha256";

module {
	public func getPlanPrice(plan : TypUser.PLanRequest) : Nat {
        switch (plan) {
            case (#basic)   { 0 };
            case (#monthly) { 100 };
            case (#yearly)  { 1000 };
        }
    };

    private func getRole(role : TypCommon.Role) : Text {
        switch (role) {
            case (#admin)      { "admin" };
            case (#maintainer) { "maintainer" };
            case (#developer)  { "developer" };
        }
    };

    private func getPlan(plan : TypUser.Plan) : Text {
        switch (plan) {
            case (#basic) { "basic" };
            case (#pro)   { "pro" };
        }
    };

    public func calculateHash(block: TypUser.UserBlock): Text {
        let dataHash = 
                Principal.toText(block.data.id) # 
                block.data.userName #
                getRole(block.data.role) # 
                getPlan(block.data.plan_type);
        
        let content = 
            Nat.toText(block.id) # 
            Int.toText(block.timestamp) # 
            block.previousHash # 
            dataHash #
            Nat.toText(block.nonce);
        
        return UtlSha256.sha256(content);
    };

    // Set data hash block
    public func hashBlock(block: TypUser.UserBlock): TypUser.UserBlock {
        return {
            block with
            hash = calculateHash(block);
        };
    }
}