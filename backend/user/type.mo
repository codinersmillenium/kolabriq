import TypCommon "../common/type";

module {
    public type Role = {
        #admin;
        #maintainer;
        #developer;
    };

    public type PLan = {
        #basic;
        #pro;
    };

    public type PLanRequest = {
        #basic;
        #monthly;
        #yearly;
    };

    public type User = {
		id              : TypCommon.UserId;
        userName        : Text;
		firstName       : Text;
		lastName        : Text;
		role            : Role;
		tags            : [TypCommon.Tags];
		referrerCode    : ?Text;
		personalRefCode : ?Text;
		plan_type       : PLan;
		plan_expired_at : ?Int;
		createdAt       : Int;
		createdById     : TypCommon.UserId;
		updatedAt       : ?Int;
		updatedById     : ?TypCommon.UserId;
		// TODO: Profile image
    };

    public type UserFilter = {
        roles : [Role];
		tags  : [TypCommon.Tags];
	};

    public type UserRequest = {
        userName     : Text;
        firstName    : Text;
		lastName     : Text;
		role         : Role;
		tags         : [TypCommon.Tags];
		referrerCode : ?Text;
	};

    public type UserResponse = {
		id              : TypCommon.UserId;
        userName        : Text;
		firstName       : Text;
		lastName        : Text;
		role            : Role;
		tags            : [TypCommon.Tags];
		referrerCode    : ?Text;
		personalRefCode : ?Text;
		plan_type       : PLan;
		plan_expired_at : ?Int;
		createdAt       : Int;
		// TODO: Profile image
    };
};