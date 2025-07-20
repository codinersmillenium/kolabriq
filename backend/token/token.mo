import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";

module {
    public type StableToken = (
        Principal,
        Nat,
    );

    public func toStable(tokens : Token) : [StableToken] {
        Iter.toArray(tokens.balances.entries());
    };

    public class Token(
        data : [StableToken],
    ) {
        public let balances = HashMap.HashMap<
            Principal, // Address owner.
            Nat,       // Amount of tokens.
        >(data.size(), Principal.equal, Principal.hash);

        public func balanceOf(owner : Principal) : Nat {
            switch (balances.get(owner)) {
                case (null)      { 500; };
                case (? balance) { balance; };
            };
        };
    }
}