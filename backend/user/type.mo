import TypCommon "../common/type";

module {

    public type Plan = {
        #basic;
        #pro;
    };

    public type PLanRequest = {
        #basic;
        #monthly;
        #yearly;
    };

	// Profile
	public type UserProfile = {
		id               : TypCommon.UserId;
		userName         : Text;
		firstName        : Text;
		lastName         : Text;
		role             : TypCommon.Role;
		tags             : [TypCommon.Tags];
		referrerCode     : ?Text;
		personalRefCode  : Text; 
		plan_type        : Plan;
		action           : UserProfileAction;
	};

	public type UserProfileAction = {
		#registration;
		#authentication: { loginTime: Int; action: AuthAction };
		#updateName:     { oldFirst: Text; newFirst: Text; oldLast: Text; newLast: Text };
		#updateRole:     { oldRole: TypCommon.Role; newRole: TypCommon.Role };
		#planUpgrade:    { oldPlan: Plan; newPlan: Plan };
	};

	public type AuthAction = {
		#login;
		#logout;
		#sessionExpired;
	};

    public type UserFilter = {
        roles   : ?[TypCommon.Role];
		tags    : ?[TypCommon.Tags];
  		keyword : ?Text;             // Search in name/username
	};

    public type UserRequest = {
        userName     : Text;
        firstName    : Text;
		lastName     : Text;
		role         : TypCommon.Role;
		tags         : [TypCommon.Tags];
		referrerCode : ?Text;
	};
	
    // MARK: Block

    // Blockchain Block Structure for Projects & Timelines
    public type UserBlock = {
        id           : TypCommon.BlockId;
        previousHash : Text;
        data         : UserProfile;
        hash         : Text;
        signature    : Text;
        timestamp    : Int;               // When block was created
        nonce        : Nat;               // For proof-of-work
    };
};