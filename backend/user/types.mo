import Principal "mo:base/Principal";

module {

    public type Role = {
        #Provider;
        #Contestant;
    };

    public type User = {
        id: Principal;
        role: Role;
    };

};