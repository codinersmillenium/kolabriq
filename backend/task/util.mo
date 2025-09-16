import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Text "mo:base/Text";

import TypTask "type";

import UtlSha256 "../utils/sha256";

module {
    public func translateOverviewError(error : TypTask.OverviewError) : Text {
        switch(error) {
            case(#not_found) { return "Task not found" };
            case(#not_done)  { return "Task is still in progress" };
            case(_)          { return "Failed get overview task" };
        };
    };

    public func getStrStatus(status : TypTask.TaskStatus) : Text {
        switch (status) {
            case (#todo)        { "todo" };
            case (#in_progress) { "in_progress" };
            case (#done)        { "done" };
        }
    };

    // calculate block hash
    public func calculateHash(block: TypTask.TaskBlock): Text {
        let dataHash = switch (block.data) {
            case (#task(data)) {
                Nat.toText(data.id) # 
                data.title # 
                data.desc #
                getStrStatus(data.status);
            };
            case (#review(data)) {
                Nat.toText(data.id) # 
                Nat.toText(data.taskId) # 
                data.review;
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
    public func hashBlock(block: TypTask.TaskBlock): TypTask.TaskBlock {
        return {
            block with
            hash = calculateHash(block);
        };
    }
}