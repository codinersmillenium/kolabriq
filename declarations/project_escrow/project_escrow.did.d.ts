import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export interface BatchPayoutRecord {
  'successfulTransfers' : bigint,
  'transfers' : Array<TransferId>,
  'totalRecipients' : bigint,
  'failedTransfers' : bigint,
  'payoutId' : PayoutId,
  'projectId' : ProjectId,
  'totalAmount' : Tokens,
  'timestamp' : bigint,
  'escrowId' : EscrowId,
  'initiatedBy' : UserId,
}
export type EscrowId = string;
export type EscrowStatus = { 'created' : null } |
  { 'active' : null } |
  { 'refunded' : null } |
  { 'funded' : null } |
  { 'depleted' : null };
export type PayoutId = string;
export interface ProjectEscrow {
  'id' : EscrowId,
  'escrowAccount' : Account,
  'status' : EscrowStatus,
  'admin' : UserId,
  'availableAmount' : Tokens,
  'createdAt' : bigint,
  'projectId' : ProjectId,
  'totalAmount' : Tokens,
  'lockTransactionId' : [] | [bigint],
}
export type ProjectId = bigint;
export type Result = { 'ok' : ProjectEscrow } |
  { 'err' : string };
export type Result_1 = { 'ok' : Tokens } |
  { 'err' : string };
export type Result_2 = { 'ok' : BatchPayoutRecord } |
  { 'err' : string };
export type Result_3 = { 'ok' : TransferRecord } |
  { 'err' : string };
export interface TeamPayout { 'recipient' : UserId, 'amount' : bigint }
export type Tokens = bigint;
export type TransferId = string;
export interface TransferRecord {
  'status' : TransferStatus,
  'recipient' : UserId,
  'transferId' : TransferId,
  'projectId' : ProjectId,
  'timestamp' : bigint,
  'icpTransactionId' : [] | [bigint],
  'escrowId' : EscrowId,
  'initiatedBy' : UserId,
  'amount' : Tokens,
}
export type TransferStatus = { 'pending' : null } |
  { 'retrying' : null } |
  { 'completed' : null } |
  { 'failed' : null };
export type UserId = Principal;
export interface _SERVICE {
  'createProjectEscrow' : ActorMethod<[bigint, bigint, Principal], Result>,
  'emergencyRefund' : ActorMethod<[string, Principal], Result_3>,
  'executeTeamPayout' : ActorMethod<
    [bigint, Array<TeamPayout>, Principal],
    Result_2
  >,
  'fundEscrow' : ActorMethod<[bigint, bigint, Principal], Result>,
  'getBatchPayoutDetails' : ActorMethod<
    [PayoutId],
    [] | [{ 'transfers' : Array<TransferRecord>, 'batch' : BatchPayoutRecord }]
  >,
  'getEscrowBalance' : ActorMethod<[EscrowId], Result_1>,
  'getEscrowBatchHistory' : ActorMethod<[EscrowId], Array<BatchPayoutRecord>>,
  'getEscrowDetail' : ActorMethod<[EscrowId], [] | [ProjectEscrow]>,
  'getEscrowFee' : ActorMethod<[], Tokens>,
  'getEscrowTransferHistory' : ActorMethod<[EscrowId], Array<TransferRecord>>,
  'getProjectEscrow' : ActorMethod<[bigint], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
