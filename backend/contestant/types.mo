import Principal "mo:base/Principal";

module {
	public type Contestant = {
		id        : Nat;
        idUser    : Principal;
        idContest : Nat;
		status    : Bool;
		endDate   : Int;
		details	  : [ContestantDetails];
	};

	public type ContestantDetails = {
		id            : Nat;
		idContestant  : Nat;
		idTermContest : Nat;
		createdAt     : Int;
	};
};