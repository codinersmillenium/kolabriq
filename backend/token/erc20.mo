import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";

import SvcToken "token";

actor {
    private stable let tokenName : Text   = "Heartbeat";
    private stable let tokenSymbol : Text = "HRBT";
    
	private stable var stableToken : [SvcToken.StableToken] = [];
	private let tokens = SvcToken.Token(stableToken);

    public query func name() : async Text { tokenName; };
    public query func symbol() : async Text { tokenSymbol; };


    // Get caller current ballance
    public shared query func balanceOf(owner : Principal) : async Nat {
        tokens.balanceOf(owner);
    };

    // This function is for demo purposes. It generates and hands out $HRBT for free.
	public shared({caller}) func buyIn(amount : Nat) : async Nat {
        let balance = tokens.balanceOf(caller);
		tokens.balances.put(caller, balance + amount);

        return tokens.balanceOf(caller);
	};

    public shared func updateBalance(owner : Principal, value : Nat) : async() {
        let balance = tokens.balanceOf(owner);
		tokens.balances.put(owner, value);
        let currBalance = tokens.balanceOf(owner);

        Debug.print("updated token [ " # Principal.toText owner # " ] f: " # Nat.toText balance # " => t: " # Nat.toText currBalance);
    };

    system func preupgrade() {
        stableToken := SvcToken.toStable(tokens);
    };

    system func postupgrade() {
        stableToken := [];
    };
};
