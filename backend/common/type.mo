import Principal "mo:base/Principal";

module {
    public type Tags = {
        #frontend;
        #backend;
        #ui;
        #bussines_analist;
    };

    public type ProjectId     = Nat;
    public type TimelineId    = Nat;
    public type TaskId        = Nat;
    public type TaskReviewId  = Nat;
    public type TaskHistoryId = Nat;
    public type UserId        = Principal;
}