import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";

import SvcToken "token";

actor {
    private stable let tokenName   : Text = "Tomato";
    private stable let tokenSymbol : Text = "TOMA";
    
	private stable var stableToken : [SvcToken.StableToken] = [];

	private let token = SvcToken.Token(stableToken);

    public query func name() : async Text { tokenName; };
    public query func symbol() : async Text { tokenSymbol; };

    // MARK: Balance of
    public shared query func balanceOf(owner : Principal) : async Nat {
        token.balanceOf(owner);
    };

    // MARK: Buy
	public shared({caller}) func buyIn(amount : Nat) : async Nat {
        let balance = token.balanceOf(caller);
		token.balances.put(caller, balance + amount);

        return token.balanceOf(caller);
	};

    // MARK: Update balance
    public shared func updateBalance(owner : Principal, value : Nat) : async() {
        let balance = token.balanceOf(owner);
		token.balances.put(owner, value);
        let currBalance = token.balanceOf(owner);

        Debug.print("updated token [ " # Principal.toText owner # " ] f: " # Nat.toText balance # " => t: " # Nat.toText currBalance);
    };

    system func preupgrade() {
        stableToken := SvcToken.toStable(token);
    };

    system func postupgrade() {
        stableToken := [];
    };
};
