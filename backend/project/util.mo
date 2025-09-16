import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Principal "mo:base/Principal";

import TypProject "type";

import UtlSha256 "../utils/sha256";

module {
    public func calculateHash(block: TypProject.ProjectBlock): Text {
        let dataHash = switch (block.data) {
            case (#project(data)) {
                Nat.toText(data.id) # 
                data.name # 
                data.desc # 
                Nat.toText(data.reward);
            };
            case (#timeline(data)) {
                Nat.toText(data.id) # 
                data.title # 
                Int.toText(data.startDate) # 
                Int.toText(data.endDate);
            };
            case (#teamAssignment(data)) {
                Nat.toText(data.projectId) # 
                Principal.toText(data.userId) # 
                Principal.toText(data.assignedBy);
            };
        };

        let content = 
            Nat.toText(block.id) # 
            Int.toText(block.timestamp) # 
            block.previousHash # 
            dataHash #
            Nat.toText(block.nonce);

        return UtlSha256.sha256(content);
    };

    // Set data hash block
    public func hashBlock(block: TypProject.ProjectBlock): TypProject.ProjectBlock {
        return {
            block with
            hash = calculateHash(block);
        };
    }
}