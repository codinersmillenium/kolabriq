import TypCommon "../common/type";

module {
    public type Role = {
        #admin;
        #maintainer;
        #developer;
    };

    public type User = {
		id          : TypCommon.UserId;
        userName    : Text;
		firstName   : Text;
		lastName    : Text;
		role        : Role;
		tags        : [TypCommon.Tags];
		createdAt   : Int;
		createdById : TypCommon.UserId;
		updatedAt   : ?Int;
		updatedById : ?TypCommon.UserId;
		// TODO: Profile image
    };

    public type UserFilter = {
        roles : [Role];
		tags  : [TypCommon.Tags];
	};

    public type UserRequest = {
        userName  : Text;
        firstName : Text;
		lastName  : Text;
		role      : Role;
		tags      : [TypCommon.Tags];
	};

    public type UserResponse = {
		id          : TypCommon.UserId;
        userName    : Text;
		firstName   : Text;
		lastName    : Text;
		role        : Role;
		tags        : [TypCommon.Tags];
		createdAt   : Int;
		// TODO: Profile image
    };
};