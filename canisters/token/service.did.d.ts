import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface PayoutTeam { 'token' : bigint, 'userId' : UserId }
export type UserId = Principal;
export interface _SERVICE {
  'balanceOf' : ActorMethod<[Principal], bigint>,
  'buyIn' : ActorMethod<[bigint], bigint>,
  'name' : ActorMethod<[], string>,
  'symbol' : ActorMethod<[], string>,
  'teamPayout' : ActorMethod<[Array<PayoutTeam>], boolean>,
  'updateBalance' : ActorMethod<[Principal, bigint], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
