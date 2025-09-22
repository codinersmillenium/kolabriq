export const idlFactory = ({ IDL }) => {
  const EscrowId = IDL.Text;
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const EscrowStatus = IDL.Variant({
    'created' : IDL.Null,
    'active' : IDL.Null,
    'refunded' : IDL.Null,
    'funded' : IDL.Null,
    'depleted' : IDL.Null,
  });
  const UserId = IDL.Principal;
  const Tokens = IDL.Nat;
  const ProjectId = IDL.Nat;
  const ProjectEscrow = IDL.Record({
    'id' : EscrowId,
    'escrowAccount' : Account,
    'status' : EscrowStatus,
    'admin' : UserId,
    'availableAmount' : Tokens,
    'createdAt' : IDL.Int,
    'projectId' : ProjectId,
    'totalAmount' : Tokens,
    'lockTransactionId' : IDL.Opt(IDL.Nat),
  });
  const Result = IDL.Variant({ 'ok' : ProjectEscrow, 'err' : IDL.Text });
  const TransferStatus = IDL.Variant({
    'pending' : IDL.Null,
    'retrying' : IDL.Null,
    'completed' : IDL.Null,
    'failed' : IDL.Null,
  });
  const TransferId = IDL.Text;
  const TransferRecord = IDL.Record({
    'status' : TransferStatus,
    'recipient' : UserId,
    'transferId' : TransferId,
    'projectId' : ProjectId,
    'timestamp' : IDL.Int,
    'icpTransactionId' : IDL.Opt(IDL.Nat),
    'escrowId' : EscrowId,
    'initiatedBy' : UserId,
    'amount' : Tokens,
  });
  const Result_3 = IDL.Variant({ 'ok' : TransferRecord, 'err' : IDL.Text });
  const TeamPayout = IDL.Record({ 'recipient' : UserId, 'amount' : IDL.Nat });
  const PayoutId = IDL.Text;
  const BatchPayoutRecord = IDL.Record({
    'successfulTransfers' : IDL.Nat,
    'transfers' : IDL.Vec(TransferId),
    'totalRecipients' : IDL.Nat,
    'failedTransfers' : IDL.Nat,
    'payoutId' : PayoutId,
    'projectId' : ProjectId,
    'totalAmount' : Tokens,
    'timestamp' : IDL.Int,
    'escrowId' : EscrowId,
    'initiatedBy' : UserId,
  });
  const Result_2 = IDL.Variant({ 'ok' : BatchPayoutRecord, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : Tokens, 'err' : IDL.Text });
  return IDL.Service({
    'createProjectEscrow' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Principal],
        [Result],
        [],
      ),
    'emergencyRefund' : IDL.Func([IDL.Text, IDL.Principal], [Result_3], []),
    'executeTeamPayout' : IDL.Func(
        [IDL.Nat, IDL.Vec(TeamPayout), IDL.Principal],
        [Result_2],
        [],
      ),
    'fundEscrow' : IDL.Func([IDL.Nat, IDL.Nat, IDL.Principal], [Result], []),
    'getBatchPayoutDetails' : IDL.Func(
        [PayoutId],
        [
          IDL.Opt(
            IDL.Record({
              'transfers' : IDL.Vec(TransferRecord),
              'batch' : BatchPayoutRecord,
            })
          ),
        ],
        ['query'],
      ),
    'getEscrowBalance' : IDL.Func([EscrowId], [Result_1], []),
    'getEscrowBatchHistory' : IDL.Func(
        [EscrowId],
        [IDL.Vec(BatchPayoutRecord)],
        ['query'],
      ),
    'getEscrowDetail' : IDL.Func(
        [EscrowId],
        [IDL.Opt(ProjectEscrow)],
        ['query'],
      ),
    'getEscrowFee' : IDL.Func([], [Tokens], ['query']),
    'getEscrowTransferHistory' : IDL.Func(
        [EscrowId],
        [IDL.Vec(TransferRecord)],
        ['query'],
      ),
    'getProjectEscrow' : IDL.Func([IDL.Nat], [Result], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
