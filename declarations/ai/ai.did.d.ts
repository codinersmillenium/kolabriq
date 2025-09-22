import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ProjectId = bigint;
export interface ProjectRequest {
  'reward' : bigint,
  'thumbnail' : Uint8Array | number[],
  'projectType' : ProjectType,
  'desc' : string,
  'name' : string,
  'tags' : Array<Tags>,
}
export type ProjectType = { 'free' : null } |
  { 'rewarded' : null };
export interface ResponseProjectPlanner {
  'projectId' : [] | [ProjectId],
  'message' : string,
}
export type Result = { 'ok' : ResponseProjectPlanner } |
  { 'err' : string };
export type Tags = { 'ui' : null } |
  { 'frontend' : null } |
  { 'business_analyst' : null } |
  { 'backend' : null };
export interface TaskRequest {
  'tag' : Tags,
  'title' : string,
  'desc' : string,
  'dueDate' : bigint,
  'projectId' : bigint,
  'assignees' : Array<Principal>,
}
export interface TimelineRequest {
  'title' : string,
  'endDate' : bigint,
  'startDate' : bigint,
}
export interface _SERVICE {
  'projectPlanner' : ActorMethod<
    [Principal, ProjectRequest, Array<TimelineRequest>, Array<TaskRequest>],
    Result
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
