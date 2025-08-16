import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";

import TypToken "type";

import SvcToken "token";

persistent actor {
    private let tokenName   : Text = "Tomato";
    private let tokenSymbol : Text = "TOMA";
    
	private var stableToken : [SvcToken.StableToken] = [];

	transient let token = SvcToken.Token(stableToken);

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

    // MARK: Payout
    public shared func teamPayout(payouts : [TypToken.PayoutTeam]) : async Bool {
        for(payout in payouts.vals()) {
            let owner = payout.userId;
            let balance = token.balanceOf(owner);
            let afterToken = balance + payout.token;
            token.balances.put(owner, afterToken);

            Debug.print("updated token [ " # Principal.toText owner # " ] f: " # Nat.toText balance # " => t: " # Nat.toText afterToken);
        };

        return true;
    };



    system func preupgrade() {
        stableToken := SvcToken.toStable(token);
    };

    system func postupgrade() {
        stableToken := [];
    };
};
