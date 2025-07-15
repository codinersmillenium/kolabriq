import Principal "mo:base/Principal";
import Text "mo:base/Text";

module {
	public type Contest = {
		id 				  : Nat;
		title       	  : Text;
		description 	  : Text;
		rewardToken 	  : Nat;
		startDate   	  : Int;
		endDate     	  : Int;
        limitParticipants : Nat;
        provider 		  : Principal;
		publishDate       : Int;
		isCompleted       : Bool;
		terms 			  :	[ContestTerms];
	};

    public type ContestRequest = {
        title             : Text;
		description       : Text;
		rewardToken       : Nat;
		startDate         : Int;
		endDate     	  : Int;
        limitParticipants : Nat;
		publishDate 	  : Int;
	};

	public type ContestFilter = {
		#all;
		#notComplete;
		#notStarted;
		#onGoing;
	};

	public type ContestTerms = {
		id 		  : Nat;
		idContest : Nat;
		name      : Text;
		description: Text;
		follow: Text;
		followType: Int;
	};

    public type ContestTermsRequest = {
        idContest : Nat;
		name 	  : Text;
		description: Text;
		follow: Text;
		followType: Int;
	};

	public type ContestTermFollowType = {
		id: Int;
		name: Text;
	}
};