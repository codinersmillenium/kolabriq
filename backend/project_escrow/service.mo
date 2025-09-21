import HashMap "mo:base/HashMap";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Principal "mo:base/Principal";

import TypEscrow "type";
import TypCommon "../common/type";

import CanIcpLedger "canister:icp_ledger";

module {
    private type ProjectHashKey = Blob;

    public type StableEscrow             = (TypCommon.EscrowId, TypEscrow.ProjectEscrow);
    public type StableProjectEscrow      = (ProjectHashKey,TypCommon.EscrowId);
    public type StableTransferHistory    = (TypCommon.TransferId, TypEscrow.TransferRecord);
    public type StableBatchPayoutHistory = (TypCommon.PayoutId, TypEscrow.BatchPayoutRecord);
    public type StableEscrowTransfer     = (TypCommon.EscrowId, [TypCommon.TransferId]);
    public type StableEscrowBatch        = (TypCommon.EscrowId, [TypCommon.PayoutId]);

    public class Escrow(
        escrowPrincipal        : Principal,
        escrowId               : Nat,
        payoutId               : Nat,
        transferId             : Nat,
        dataEscrows            : [StableEscrow],
        dataProjectEscrowIndex : [StableProjectEscrow],
        dataTransferHistory    : [StableTransferHistory],
        dataBatchPayoutHistory : [StableBatchPayoutHistory],
        dataEscrowTransfers    : [StableEscrowTransfer],
        dataEscrowBatches      : [StableEscrowBatch],
    ) {
        public var nextEscrowId   = escrowId;
        public var nextPayoutId   = payoutId;
        public var nextTransferId = transferId;

        public var escrows            = HashMap.HashMap<TypCommon.EscrowId, TypEscrow.ProjectEscrow>(dataEscrows.size(), Text.equal, Text.hash);
        public var projectEscrowIndex = HashMap.HashMap<ProjectHashKey,TypCommon.EscrowId>(dataProjectEscrowIndex.size(), Blob.equal, Blob.hash);

        // HISTORY STORAGE - Two levels of detail
        public var transferHistory    = HashMap.HashMap<TypCommon.TransferId, TypEscrow.TransferRecord>(dataTransferHistory.size(), Text.equal, Text.hash);     // Detailed per-transfer
        public var batchPayoutHistory = HashMap.HashMap<TypCommon.PayoutId, TypEscrow.BatchPayoutRecord>(dataBatchPayoutHistory.size(), Text.equal, Text.hash); // Summary per-batch

        // Index for quick lookups
        public var escrowTransfers = HashMap.HashMap<TypCommon.EscrowId, [TypCommon.TransferId]>(dataEscrowTransfers.size(), Text.equal, Text.hash);
        public var escrowBatches   = HashMap.HashMap<TypCommon.EscrowId, [TypCommon.PayoutId]>(dataEscrowBatches.size(), Text.equal, Text.hash);

        public let ICP_FEE: TypEscrow.Tokens = 10_000; // 0.0001 ICP

        // MARK: Incremental id

        public func getEscrowId() : Nat {
            let escrowId   = nextEscrowId;
            nextEscrowId += 1;
            return escrowId;
        };

        public func getPayoutId() : Nat {
            let payoutId   = nextPayoutId;
            nextPayoutId += 1;
            return payoutId;
        };

        public func getTransferId() : Nat {
            let transferId     = nextTransferId;
            nextTransferId += 1;
            return transferId;
        };

        // MARK: Generate account

        public func generateEscrowAccount(
            projectId : TypCommon.ProjectId,
        ): TypEscrow.Account {
            // Convert Nat to Nat32 for bitwise operations
            let projectId32 = Nat32.fromNat(projectId % (2**32)); // Ensure fits in 32 bits
            
            // Extract 4 bytes using Nat32 bitwise operations
            let byte0 = Nat8.fromNat(Nat32.toNat((projectId32 >> 24) & 0xFF));
            let byte1 = Nat8.fromNat(Nat32.toNat((projectId32 >> 16) & 0xFF));
            let byte2 = Nat8.fromNat(Nat32.toNat((projectId32 >> 8) & 0xFF));
            let byte3 = Nat8.fromNat(Nat32.toNat(projectId32 & 0xFF));

            // Create exactly 32 bytes array
            let subaccountBytes: [Nat8] = [
                // 28 zeros + 4 bytes project ID
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0,
                byte0, byte1, byte2, byte3
            ];

            {
                owner      = escrowPrincipal;
                subaccount = ?Blob.fromArray(subaccountBytes);
            }
        };

        // MARK: Icrc2 transfere err

        public func icrc2TransferErrTranslate(err : CanIcpLedger.TransferFromError) : Text {
            switch (err) {
                case (#BadBurn {min_burn_amount}) {
                    "BadBurn: minimum burn amount = " # Nat.toText(min_burn_amount)
                };
                case (#BadFee {expected_fee}) {
                    "BadFee: expected fee = " # Nat.toText(expected_fee)
                };
                case (#CreatedInFuture {ledger_time}) {
                    "CreatedInFuture: ledger time = " # Nat64.toText(ledger_time)
                };
                case (#Duplicate {duplicate_of}) {
                    "Duplicate: of block " # Nat.toText(duplicate_of)
                };
                case (#GenericError {error_code; message}) {
                    "GenericError: code " # Nat.toText(error_code) # ", message = " # message
                };
                case (#InsufficientAllowance {allowance}) {
                    "InsufficientAllowance: allowance = " # Nat.toText(allowance)
                };
                case (#InsufficientFunds {balance}) {
                    "InsufficientFunds: balance = " # Nat.toText(balance)
                };
                case (#TemporarilyUnavailable) {
                    "TemporarilyUnavailable"
                };
                case (#TooOld) {
                    "TooOld"
                };
            }
        };

        // MARK: Icrc1 transfere err

        public func icrc1TransferErrTranslate(err : CanIcpLedger.Icrc1TransferError) : Text {
            switch (err) {
                case (#BadFee { expected_fee }) {
                    "BadFee: expected fee = " # Nat.toText(expected_fee)
                };
                case (#BadBurn { min_burn_amount }) {
                    "BadBurn: min burn amount = " # Nat.toText(min_burn_amount)
                };
                case (#InsufficientFunds { balance }) {
                    "InsufficientFunds: balance = " # Nat.toText(balance)
                };
                case (#TooOld) {
                    "TooOld: transaction is too old"
                };
                case (#CreatedInFuture { ledger_time }) {
                    "CreatedInFuture: ledger time = " # Nat64.toText(ledger_time)
                };
                case (#TemporarilyUnavailable) {
                    "TemporarilyUnavailable: ledger not available"
                };
                case (#Duplicate { duplicate_of }) {
                    "Duplicate: duplicate of block " # Nat.toText(duplicate_of)
                };
                case (#GenericError { error_code; message }) {
                    "GenericError: code " # Nat.toText(error_code) # ", message = " # message
                };
            }

        };

    }
}