import TypCommon "../common/type";

module {
    // MARK: ICP ledger (ICRC-1)

    public type Account      = { owner : Principal; subaccount : ?Blob };
    public type Tokens       = Nat;
    public type TransferArgs = {
        from            : Account;
        to              : Account;
        amount          : Tokens;
        fee             : ?Tokens;
        memo            : ?Nat;
        created_at_time : ?Nat64;
    };

    // MARK: Escrow

    public type TeamPayout = {
        recipient : TypCommon.UserId;
        amount    : Nat;
    };

    public type ProjectEscrow = {
        id                : TypCommon.EscrowId;
        projectId         : TypCommon.ProjectId;
        admin             : TypCommon.UserId;
        totalAmount       : Tokens;              // Total ICP locked
        availableAmount   : Tokens;              // Available for payout
        escrowAccount     : Account;             // Unique subaccount
        status            : EscrowStatus;
        createdAt         : Int;
        lockTransactionId : ?Nat;
    };

    public type EscrowStatus = {
        #created;  // Created, waiting for funding
        #funded;   // Funded and ready for payouts
        #active;   // Has ongoing payouts
        #depleted; // All funds paid out
        #refunded; // Refunded to admin
    };
  
    public type TransferRecord = {
        transferId       : TypCommon.TransferId;
        escrowId         : TypCommon.EscrowId;
        projectId        : TypCommon.ProjectId;
        recipient        : TypCommon.UserId;
        amount           : Tokens;
        timestamp        : Int;
        icpTransactionId : ?Nat;
        status           : TransferStatus;
        initiatedBy      : TypCommon.UserId;
    };

    public type TransferStatus = {
        #pending;
        #completed;
        #failed;
        #retrying;
    };

    // Batch payout record (summary history)
    public type BatchPayoutRecord = {
        payoutId            : TypCommon.PayoutId;
        escrowId            : TypCommon.EscrowId;
        projectId           : TypCommon.ProjectId;
        totalAmount         : Tokens;
        totalRecipients     : Nat;
        successfulTransfers : Nat;
        failedTransfers     : Nat;
        timestamp           : Int;
        initiatedBy         : TypCommon.UserId;
        transfers           : [TypCommon.TransferId];
    };
}