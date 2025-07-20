import Principal "mo:base/Principal";
module {
    public type Tags = {
        #Frontend;
        #Backend;
        #UI;
        #BussinesAnalist;
    };

    public type ProjectId     = Nat;
    public type TimelineId    = Nat;
    public type TaskId        = Nat;
    public type TaskReviewId  = Nat;
    public type UserId        = Principal;
}