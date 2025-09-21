import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Int "mo:base/Int";

import TypEscrow "type";
import TypCommon "../common/type";

import SvcEscrow "service";

import Utl "../utils/helper";
import UtlDate "../utils/date";

import CanUser "canister:user";
import CanIcpLedger "canister:icp_ledger";

persistent actor ProjectEscrow {
    private type UserTeamRefKey  = Text;

    private var escrowPrincipal = Principal.fromActor(ProjectEscrow);

    private var nextEscrowId   : Nat = 0;
    private var nextPayoutId   : Nat = 0;
    private var nextTransferId : Nat = 0;

    private var stableEscrow             : [SvcEscrow.StableEscrow]             = [];
    private var stableProjectEscrow      : [SvcEscrow.StableProjectEscrow]      = [];
    private var stableTransferHistory    : [SvcEscrow.StableTransferHistory]    = [];
    private var stableBatchPayoutHistory : [SvcEscrow.StableBatchPayoutHistory] = [];
    private var stableEscrowTransfer     : [SvcEscrow.StableEscrowTransfer]     = [];
    private var stableEscrowBatch        : [SvcEscrow.StableEscrowBatch]        = [];

    transient let escrow = SvcEscrow.Escrow(
        escrowPrincipal,
        nextEscrowId,
        nextPayoutId, 
        nextTransferId,
        stableEscrow,
        stableProjectEscrow,
        stableTransferHistory,
        stableBatchPayoutHistory,
        stableEscrowTransfer,
        stableEscrowBatch,
    );

    // MARK: Admin validation

    private func adminValidation(admin : Principal): async Bool {
        let user = await CanUser.getUserDetail(admin);
        switch(user) {
            case(#err(_))   { return false;};
            case(#ok(user)) { return user.role == #admin; };
        };
    };

    // MARK: Create escrow

    public func createProjectEscrow(
        projectId   : Nat,
        totalAmount : Nat,
        admin       : Principal,
    ): async Result.Result<TypEscrow.ProjectEscrow, Text> {
        // Check if project already has escrow
        switch (escrow.projectEscrowIndex.get(Utl.natToBlob(projectId))) {
            case (?_)   { return #err("Project already has an escrow"); };
            case (null) {
                // Validation admin
                let checkAdmin = await adminValidation(admin);
                if (not checkAdmin) { return #err("Only authorized escrow admin can fund")};

                // Create project escrow
                let escrowId = "ESC_" # Nat.toText(escrow.getEscrowId());
                let escrowAccount = escrow.generateEscrowAccount(projectId);
                
                // Create escrow entry
                let dataEscrow: TypEscrow.ProjectEscrow = {
                    id                = escrowId;
                    projectId         = projectId;
                    admin             = admin;
                    totalAmount       = totalAmount;
                    availableAmount   = 0;             // Will be set when funded
                    escrowAccount     = escrowAccount;
                    status            = #created;
                    createdAt         = UtlDate.now();
                    lockTransactionId = null;
                };

                // Transfer ICP to escrow
                let transferArgs: CanIcpLedger.TransferFromArgs = {
                    spender_subaccount = null;
                    from               = { owner = admin; subaccount = null };
                    to                 = dataEscrow.escrowAccount;
                    amount             = dataEscrow.totalAmount;
                    fee                = ?escrow.ICP_FEE;
                    memo               = ?Text.encodeUtf8("Escrow funding: " # dataEscrow.id);
                    created_at_time    = null;
                };
                
                try {
                    let transferResult = await CanIcpLedger.icrc2_transfer_from(transferArgs);
                    
                    switch (transferResult) {
                        case (#Ok(transactionId)) {
                            Debug.print("Success transfer: " # Nat.toText(transferArgs.amount) # " to escrow with id: " # Nat.toText(transactionId));
                            
                            let fundedEscrow = {
                                dataEscrow with
                                status            = #funded;
                                availableAmount   = dataEscrow.totalAmount;
                                lockTransactionId = ?transactionId;
                            };
                            
                            escrow.escrows.put(dataEscrow.id, fundedEscrow);
                            escrow.projectEscrowIndex.put(Utl.natToBlob(projectId), escrowId);
                            
                            return #ok(fundedEscrow);
                        };
                        case (#Err(error)) {
                            Debug.print("Failed transfer. ICP Error: " # escrow.icrc2TransferErrTranslate(error));
                            return #err("ICP transfer failed");
                        };
                    };
                } catch (error) {
                    Debug.print("ICP Error: " # Error.message(error));
                    return #err("Exception during ICP transfer");
                };
            };
        };
    };

    // MARK: Fund escrow

    public func fundEscrow(
        projectId   : Nat,
        totalAmount : Nat,
        admin       : Principal,
    ): async Result.Result<TypEscrow.ProjectEscrow, Text> {
        // Check if project already has escrow
        switch (escrow.projectEscrowIndex.get(Utl.natToBlob(projectId))) {
            case (null)      { return #err("Escrow not found"); };
            case (?escrowId) {
                switch (escrow.escrows.get(escrowId)) {
                    case (null)    { return #err("Escrow not found"); };
                    case (?dataEscrow) {
                        // Validation admin
                        let checkAdmin = await adminValidation(admin);
                        if (not checkAdmin) { return #err("Only authorized escrow admin can fund")};

                        if (dataEscrow.status != #created and dataEscrow.status != #funded) {
                            return #err("Escrow not in fundable state");
                        };
            
                        // Check admin balance
                        let adminAccount = { owner = admin; subaccount = null };
                        let adminBalance = await CanIcpLedger.icrc1_balance_of(adminAccount);
                        let totalRewward = totalAmount + escrow.ICP_FEE;
                        
                        if (adminBalance < totalRewward) {
                            return #err("Insufficient ICP balance");
                        };

                        // Transfer ICP to escrow
                        let transferArgs: CanIcpLedger.TransferFromArgs = {
                            spender_subaccount = null;
                            from               = adminAccount;
                            to                 = dataEscrow.escrowAccount;
                            amount             = totalAmount;
                            fee                = ?escrow.ICP_FEE;
                            memo               = ?Text.encodeUtf8("Escrow funding: " # dataEscrow.id);
                            created_at_time    = null;
                        };
                        
                        try {
                            let transferResult = await CanIcpLedger.icrc2_transfer_from(transferArgs);
                            
                            switch (transferResult) {
                                case (#Ok(transactionId)) {
                                    Debug.print("Success transfer: " # Nat.toText(transferArgs.amount) # " to escrow with id: " # Nat.toText(transactionId));
                                    
                                    let fundedEscrow = {
                                        dataEscrow with
                                        status            = #funded;
                                        availableAmount   = dataEscrow.totalAmount;
                                        lockTransactionId = ?transactionId;
                                    };
                                    
                                    escrow.escrows.put(dataEscrow.id, fundedEscrow);
                                    
                                    return #ok(fundedEscrow);
                                };
                                case (#Err(error)) {
                                    Debug.print("Failed transfer. ICP Error: " # escrow.icrc2TransferErrTranslate(error));
                                    return #err("ICP transfer failed");
                                };
                            };
                        } catch (error) {
                            Debug.print("ICP Error: " # Error.message(error));
                            return #err("Exception during ICP transfer");
                        };
                    };
                };
            };
        };
    };

    // MARK: Payout Team

    public func executeTeamPayout(
        projectId   : Nat,
        teamPayouts : [TypEscrow.TeamPayout],
        initiatedBy : Principal,
    ): async Result.Result<TypEscrow.BatchPayoutRecord, Text> {
        switch (escrow.projectEscrowIndex.get(Utl.natToBlob(projectId))) {
            case (null)      { return #err("Escrow not found"); };
            case (?escrowId) {
                switch (escrow.escrows.get(escrowId)) {
                    case (null)    { return #err("Escrow not found"); };
                    case (?dataEscrow) {
                        // Validation admin
                        let checkAdmin = await adminValidation(initiatedBy);
                        if (not checkAdmin) { return #err("Only authorized escrow admin can execute payouts")};
                        
                        // Check escrow status
                        if (dataEscrow.status != #funded and dataEscrow.status != #active) {
                            return #err("Escrow not ready for payouts");
                        };
                        
                        // Calculate total payout amount
                        let totalPayoutAmount = Array.foldLeft<TypEscrow.TeamPayout, TypEscrow.Tokens>(
                            teamPayouts, 
                            0, 
                            func(acc, payout) = acc + payout.amount
                        );

                        // Check available funds (including transfer fees)
                        if (dataEscrow.availableAmount < totalPayoutAmount) {
                            return #err("Insufficient escrow balance. Required: " # Nat.toText(totalPayoutAmount) # ", Available: " # Nat.toText(dataEscrow.availableAmount));
                        };
                        
                        // Generate batch payout ID
                        let payoutId = "PAYOUT_" # Nat.toText(escrow.getPayoutId());
                        
                        // Execute individual transfers
                        let transferResults = await processIndividualTransfers(
                            dataEscrow, 
                            teamPayouts, 
                            initiatedBy
                        );
                        
                        // Count successful/failed transfers
                        var successfulCount     = 0;
                        var failedCount         = 0;
                        var transferIds: [Text] = [];
                        
                        for (transferResult in transferResults.vals()) {
                            switch (transferResult.status) {
                                case (#completed) { successfulCount += 1; };
                                case (#failed)    { failedCount += 1; };
                                case (_)          { };
                            };
                            transferIds := Array.append(transferIds, [transferResult.transferId]);
                        };
                        
                        // Update escrow available amount
                        let successfulAmount = Array.foldLeft<TypEscrow.TransferRecord, TypEscrow.Tokens>(
                            transferResults,
                            0,
                            func(acc, transfer) = if (transfer.status == #completed) acc + transfer.amount else acc
                        );
                        
                        let newAvailableAmount = Nat.sub(dataEscrow.availableAmount, successfulAmount);
                        let newStatus          = if (newAvailableAmount <= escrow.ICP_FEE) #depleted else #active;
                        
                        let updatedEscrow = {
                            dataEscrow with
                            availableAmount = newAvailableAmount;
                            status          = newStatus;
                        };

                        escrow.escrows.put(escrowId, updatedEscrow);
                        
                        // Create batch payout record
                        let batchRecord: TypEscrow.BatchPayoutRecord = {
                            payoutId            = payoutId;
                            escrowId            = escrowId;
                            projectId           = dataEscrow.projectId;
                            totalAmount         = totalPayoutAmount;
                            totalRecipients     = teamPayouts.size();
                            successfulTransfers = successfulCount;
                            failedTransfers     = failedCount;
                            timestamp           = UtlDate.now();
                            initiatedBy         = initiatedBy;
                            transfers           = transferIds;
                        };
                        
                        // Store batch history
                        escrow.batchPayoutHistory.put(payoutId, batchRecord);
                        
                        // Update escrow batch index
                        switch (escrow.escrowBatches.get(escrowId)) {
                            case (null)     { escrow.escrowBatches.put(escrowId, [payoutId]); };
                            case (?batches) { escrow.escrowBatches.put(escrowId, Array.append(batches, [payoutId])); };
                        };
                        
                        return #ok(batchRecord);
                    };
                };
            };
        };
    };

    // MARK: Process individual ICP transfers
    
    private func processIndividualTransfers(
        dataEscrow  : TypEscrow.ProjectEscrow,
        teamPayouts : [TypEscrow.TeamPayout],
        initiatedBy : TypCommon.UserId
    ): async [TypEscrow.TransferRecord] {
        
        var transferRecords: [TypEscrow.TransferRecord] = [];
        
        for (payout in teamPayouts.vals()) {
            // Generate transfer ID
            let transferId = "TXF_" # Nat.toText(escrow.getTransferId());
            let actualAmount = Nat.sub(payout.amount, escrow.ICP_FEE); // Fee fee charged to user
            
            // Create transfer record (initially pending)
            var transferRecord: TypEscrow.TransferRecord = {
                transferId       = transferId;
                escrowId         = dataEscrow.id;
                projectId        = dataEscrow.projectId;
                recipient        = payout.recipient;
                amount           = actualAmount;
                timestamp        = UtlDate.now();
                icpTransactionId = null;
                status           = #pending;
                initiatedBy      = initiatedBy;
            };

            // Execute ICP transfer
            let transferArgs: CanIcpLedger.TransferArg = {
                from_subaccount = dataEscrow.escrowAccount.subaccount;
                to              = { owner = payout.recipient; subaccount = null };
                amount          = actualAmount;
                fee             = ?escrow.ICP_FEE;
                memo            = ?Text.encodeUtf8(Int.toText(UtlDate.now()) # " - " # Nat.toText(actualAmount));
                created_at_time = null;
            };
            
            try {
                let transferResult = await CanIcpLedger.icrc1_transfer(transferArgs);
                
                switch (transferResult) {
                    case (#Ok(transactionId)) {
                        Debug.print("Trasfer success: " # Nat.toText(actualAmount) # " to team addr: " # Principal.toText(payout.recipient));
                        
                        transferRecord := {
                            transferRecord with
                            icpTransactionId = ?transactionId;
                            status           = #completed;
                        };
                    };
                    case (#Err(error)) {
                        Debug.print(
                            "Transfer failed for " # 
                            Principal.toText(payout.recipient) #
                            ". ICP Error: " #
                            escrow.icrc1TransferErrTranslate(error)
                        );
                        
                        transferRecord := {
                            transferRecord with
                            status = #failed;
                        };
                    };
                };
            } catch (error) {
                Debug.print(
                    "Exception during transfer to " # 
                    Principal.toText(payout.recipient) # 
                    ". ICP Error: " #
                    Error.message(error)
                );

                transferRecord := {
                    transferRecord with
                    status = #failed;
                };
            };
            
            // Store individual transfer record
            escrow.transferHistory.put(transferId, transferRecord);
            transferRecords := Array.append(transferRecords, [transferRecord]);
            
            // Update escrow transfer index
            switch (escrow.escrowTransfers.get(dataEscrow.id)) {
                case (null)       { escrow.escrowTransfers.put(dataEscrow.id, [transferId]); };
                case (?transfers) { escrow.escrowTransfers.put(dataEscrow.id, Array.append(transfers, [transferId])); };
            };
        };
        
        transferRecords;
    };

    // MARK: Emergency refund

    // Emergency refund
    public func emergencyRefund(
        escrowId     : Text,
        authorizedBy : Principal,
    ): async Result.Result<TypEscrow.TransferRecord, Text> {
        switch (escrow.escrows.get(escrowId)) {
            case (null) { return #err("Escrow not found"); };
            case (?dataEscrow) {
                if (authorizedBy != dataEscrow.admin) {
                    return #err("Unauthorized refund attempt");
                };
                
                if (dataEscrow.availableAmount == 0) {
                    return #err("No funds available for refund");
                };

                // Transfer ICP to escrow
                let transferArgs: CanIcpLedger.TransferFromArgs = {
                    spender_subaccount = null;
                    from               = dataEscrow.escrowAccount;
                    to                 = { owner = dataEscrow.admin; subaccount = null };
                    amount             = dataEscrow.availableAmount - escrow.ICP_FEE;
                    fee                = ?escrow.ICP_FEE;
                    memo               = ?Text.encodeUtf8("Emergency refund");
                    created_at_time    = null;
                };
                
                try {
                    let transferResult = await CanIcpLedger.icrc2_transfer_from(transferArgs);
                    
                    switch (transferResult) {
                        case (#Ok(transactionId)) {
                            // Update escrow
                            let refundedEscrow = {
                                dataEscrow with
                                status          = #refunded;
                                availableAmount = 0;
                            };
                            escrow.escrows.put(escrowId, refundedEscrow);
                            
                            // Create refund record
                            let transferId = "REFUND_" # Nat.toText(escrow.getTransferId());
                            
                            let refundRecord: TypEscrow.TransferRecord = {
                                transferId       = transferId;
                                escrowId         = escrowId;
                                projectId        = dataEscrow.projectId;
                                recipient        = dataEscrow.admin;
                                amount           = dataEscrow.availableAmount - escrow.ICP_FEE;
                                timestamp        = UtlDate.now();
                                icpTransactionId = ?transactionId;
                                status           = #completed;
                                initiatedBy      = authorizedBy;
                            };
                            
                            escrow.transferHistory.put(transferId, refundRecord);
                            
                            return #ok(refundRecord);
                        };
                        case (#Err(error)) {
                            Debug.print("Failed transfer. ICP Error: " # escrow.icrc2TransferErrTranslate(error));
                            return #err("Refund transfer failed");
                        };
                    };
                } catch (error) {
                    Debug.print("ICP Error: " # Error.message(error));
                    return #err("Exception during refund");
                };
            };
        };
    };

    // MARK: Get detail

    public query func getEscrowDetail(
        escrowId : TypCommon.EscrowId
    ): async ?TypEscrow.ProjectEscrow {
        escrow.escrows.get(escrowId);
    };

    // MARK: Get by project id

    public query func getProjectEscrow(
        projectId : Nat
    ): async Result.Result<TypEscrow.ProjectEscrow, Text> {
        switch (escrow.projectEscrowIndex.get(Utl.natToBlob(projectId))) {
            case (null)      { #err("Project escrow not found"); };
            case (?escrowId) { 
                switch(escrow.escrows.get(escrowId)) {
                    case (null)        { #err("Escrow not found"); };
                    case (?dataEscrow) { #ok(dataEscrow) };
                };
             };
        };
    };

    // MARK: Get batch history

    // Get batch payout history for escrow (Summary level)
    public query func getEscrowBatchHistory(
        escrowId : TypCommon.EscrowId
    ): async [TypEscrow.BatchPayoutRecord] {
        switch (escrow.escrowBatches.get(escrowId)) {
            case (null)      { []; };
            case (?batchIds) {
                Array.mapFilter<TypCommon.PayoutId, TypEscrow.BatchPayoutRecord>(
                    batchIds,
                    func(batchId) = escrow.batchPayoutHistory.get(batchId)
                );
            };
        };
    };

    // MARK: Get transfer history

    // Get detailed transfer history for escrow (Detail level)
    public query func getEscrowTransferHistory(
        escrowId : TypCommon.EscrowId
    ): async [TypEscrow.TransferRecord] {
        switch (escrow.escrowTransfers.get(escrowId)) {
            case (null)         { []; };
            case (?transferIds) {
                Array.mapFilter<Text, TypEscrow.TransferRecord>(
                    transferIds,
                    func(transferId) = escrow.transferHistory.get(transferId)
                );
            };
        };
    };

    // MARK: Get batch detail

    // Get specific batch details with all transfers
    public query func getBatchPayoutDetails(payoutId: TypCommon.PayoutId): async ?{
        batch     : TypEscrow.BatchPayoutRecord;
        transfers : [TypEscrow.TransferRecord];
    } {
        switch (escrow.batchPayoutHistory.get(payoutId)) {
            case (null)   { null; };
            case (?batch) {
                let transfers = Array.mapFilter<Text, TypEscrow.TransferRecord>(
                    batch.transfers,
                    func(transferId) = escrow.transferHistory.get(transferId)
                );
                
                return ?{
                    batch     = batch;
                    transfers = transfers;
                };
            };
        };
    };

    // MARK: Get balance

    public func getEscrowBalance(
        escrowId : TypCommon.EscrowId
    ): async Result.Result<TypEscrow.Tokens, Text> {
        switch (escrow.escrows.get(escrowId)) {
            case (null)        { #err("Escrow not found"); };
            case (?dataEscrow) {
                let balance = await CanIcpLedger.icrc1_balance_of(dataEscrow.escrowAccount);
                return #ok(balance);
            };
        };
    };

    // MARK: Get fee

    public query func getEscrowFee(): async TypEscrow.Tokens {
        return escrow.ICP_FEE;
    };
}