import Principal "mo:base/Principal";

module {
    public type Tags = {
        #frontend;
        #backend;
        #ui;
        #business_analyst;
    };
    
    public type Role = {
        #admin;
        #maintainer;
        #developer;
    };

    public type BlockId       = Nat;
    public type ProjectId     = Nat;
    public type TimelineId    = Nat;
    public type TaskId        = Nat;
    public type ReviewId      = Nat;
    public type TaskHistoryId = Nat;
    public type UserId        = Principal;

    public type EscrowId   = Text;
    public type PayoutId   = Text;
    public type TransferId = Text;

}