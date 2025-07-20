import TypUser "type";

module {
	public func getPlanPrice(plan : TypUser.PLanRequest) : Nat {
        switch (plan) {
            case (#basic)   { 0 };
            case (#monthly) { 100 };
            case (#yearly)  { 1000 };
        }
    };
}