import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type AuthAction = { 'sessionExpired' : null } |
  { 'logout' : null } |
  { 'login' : null };
export type BlockId = bigint;
export type Plan = { 'pro' : null } |
  { 'basic' : null };
export type Result = { 'ok' : UserProfile } |
  { 'err' : string };
export type Result_1 = { 'ok' : Array<UserProfile> } |
  { 'err' : string };
export type Result_2 = { 'ok' : Array<UserProfile> } |
  { 'err' : null };
export type Result_3 = { 'ok' : Array<UserBlock> } |
  { 'err' : string };
export type Result_4 = { 'ok' : string } |
  { 'err' : string };
export type Role = { 'admin' : null } |
  { 'maintainer' : null } |
  { 'developer' : null };
export type Tags = { 'ui' : null } |
  { 'frontend' : null } |
  { 'business_analyst' : null } |
  { 'backend' : null };
export interface UserBlock {
  'id' : BlockId,
  'signature' : string,
  'data' : UserProfile,
  'hash' : string,
  'nonce' : bigint,
  'timestamp' : bigint,
  'previousHash' : string,
}
export interface UserFilter {
  'tags' : [] | [Array<Tags>],
  'keyword' : [] | [string],
  'roles' : [] | [Array<Role>],
}
export type UserId = Principal;
export interface UserProfile {
  'id' : UserId,
  'userName' : string,
  'action' : UserProfileAction,
  'referrerCode' : [] | [string],
  'plan_type' : Plan,
  'role' : Role,
  'tags' : Array<Tags>,
  'personalRefCode' : string,
  'lastName' : string,
  'firstName' : string,
}
export type UserProfileAction = {
    'authentication' : { 'loginTime' : bigint, 'action' : AuthAction }
  } |
  {
    'updateName' : {
      'newFirst' : string,
      'oldFirst' : string,
      'newLast' : string,
      'oldLast' : string,
    }
  } |
  { 'updateRole' : { 'oldRole' : Role, 'newRole' : Role } } |
  { 'planUpgrade' : { 'newPlan' : Plan, 'oldPlan' : Plan } } |
  { 'registration' : null };
export interface UserRequest {
  'userName' : string,
  'referrerCode' : [] | [string],
  'role' : Role,
  'tags' : Array<Tags>,
  'lastName' : string,
  'firstName' : string,
}
export interface _SERVICE {
  'checkPrincipal' : ActorMethod<[], Principal>,
  'getTeamRefCode' : ActorMethod<[], Result_4>,
  'getUserDetail' : ActorMethod<[Principal], Result>,
  'getUserHistory' : ActorMethod<[Principal], Result_3>,
  'getUserList' : ActorMethod<[UserFilter], Result_2>,
  'getUsersByIds' : ActorMethod<[Array<Principal>], Result_1>,
  'healthCheck' : ActorMethod<
    [],
    {
      'lastBlockHash' : string,
      'totalBlocks' : bigint,
      'chainIntegrity' : boolean,
      'totalUsers' : bigint,
    }
  >,
  'login' : ActorMethod<[], Result>,
  'logout' : ActorMethod<[], Result>,
  'registerUser' : ActorMethod<[UserRequest], Result>,
  'updateRole' : ActorMethod<[Principal, Role], Result>,
  'updateUser' : ActorMethod<[UserRequest], Result>,
  'upgradePlan' : ActorMethod<[Plan], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
