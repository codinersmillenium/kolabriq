import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type BlockId = bigint;
export interface LLMSaveResponse {
  'endDate' : bigint,
  'project' : Project,
  'startDate' : bigint,
}
export interface Project {
  'id' : ProjectId,
  'status' : ProjectStatus,
  'reward' : bigint,
  'action' : ProjectAction,
  'thumbnail' : Uint8Array | number[],
  'projectType' : ProjectType,
  'ownerId' : UserId,
  'desc' : string,
  'name' : string,
  'createdBy' : UserId,
  'tags' : Array<Tags>,
}
export type ProjectAction = {
    'metadataUpdate' : {
      'field' : string,
      'oldValue' : string,
      'newValue' : string,
    }
  } |
  { 'create' : null } |
  { 'rewardUpdate' : { 'to' : bigint, 'from' : bigint } } |
  { 'statusUpdate' : { 'to' : ProjectStatus, 'from' : ProjectStatus } };
export interface ProjectBlock {
  'id' : BlockId,
  'signature' : string,
  'data' : ProjectBlockData,
  'hash' : string,
  'nonce' : bigint,
  'timestamp' : bigint,
  'previousHash' : string,
}
export type ProjectBlockData = { 'teamAssignment' : TeamAssignment } |
  { 'project' : Project } |
  { 'timeline' : Timeline };
export interface ProjectFilter {
  'status' : [] | [ProjectStatus],
  'projectType' : [] | [ProjectType],
  'tags' : [] | [Array<Tags>],
  'keyword' : [] | [string],
}
export type ProjectId = bigint;
export interface ProjectRequest {
  'reward' : bigint,
  'thumbnail' : Uint8Array | number[],
  'projectType' : ProjectType,
  'desc' : string,
  'name' : string,
  'tags' : Array<Tags>,
}
export type ProjectStatus = { 'new' : null } |
  { 'review' : null } |
  { 'done' : null } |
  { 'in_progress' : null };
export type ProjectType = { 'free' : null } |
  { 'rewarded' : null };
export type Result = { 'ok' : Timeline } |
  { 'err' : string };
export type Result_1 = { 'ok' : Project } |
  { 'err' : string };
export type Result_2 = { 'ok' : LLMSaveResponse } |
  { 'err' : string };
export type Result_3 = { 'ok' : Array<ProjectBlock> } |
  { 'err' : string };
export type Result_4 = { 'ok' : Array<Timeline> } |
  { 'err' : string };
export type Result_5 = { 'ok' : Array<UserId> } |
  { 'err' : string };
export type Result_6 = { 'ok' : Array<Project> } |
  { 'err' : null };
export type Result_7 = { 'ok' : string } |
  { 'err' : string };
export type Tags = { 'ui' : null } |
  { 'frontend' : null } |
  { 'business_analyst' : null } |
  { 'backend' : null };
export type TeamAction = { 'assign' : null } |
  { 'unassign' : null };
export interface TeamAssignment {
  'action' : TeamAction,
  'assignedBy' : UserId,
  'userId' : UserId,
  'projectId' : ProjectId,
}
export interface Timeline {
  'id' : TimelineId,
  'title' : string,
  'action' : TimelineAction,
  'endDate' : bigint,
  'createdBy' : UserId,
  'projectId' : ProjectId,
  'startDate' : bigint,
}
export type TimelineAction = {
    'dateUpdate' : {
      'field' : string,
      'oldValue' : bigint,
      'newValue' : bigint,
    }
  } |
  {
    'metadataUpdate' : {
      'field' : string,
      'oldValue' : string,
      'newValue' : string,
    }
  } |
  { 'create' : null };
export type TimelineId = bigint;
export interface TimelineRequest {
  'title' : string,
  'endDate' : bigint,
  'startDate' : bigint,
}
export type UserId = Principal;
export interface _SERVICE {
  'assignProjectTeam' : ActorMethod<
    [string, bigint, Array<Principal>],
    Result_7
  >,
  'createProject' : ActorMethod<[string, ProjectRequest], Result_1>,
  'createTimeline' : ActorMethod<[bigint, TimelineRequest], Result>,
  'getOwnedProjectList' : ActorMethod<[string, ProjectFilter], Result_6>,
  'getProjectByKeyword' : ActorMethod<[string, string], Result_1>,
  'getProjectDetail' : ActorMethod<[bigint], Result_1>,
  'getProjectHistory' : ActorMethod<[bigint], Result_3>,
  'getProjectTeam' : ActorMethod<[bigint], Result_5>,
  'getProjectTimelines' : ActorMethod<[bigint], Result_4>,
  'getTimelineDetail' : ActorMethod<[bigint], Result>,
  'getTimelineHistory' : ActorMethod<[bigint], Result_3>,
  'healthCheck' : ActorMethod<
    [],
    {
      'lastBlockHash' : string,
      'totalTimelines' : bigint,
      'totalProjects' : bigint,
      'totalBlocks' : bigint,
      'chainIntegrity' : boolean,
    }
  >,
  'saveLlmProjectTimelines' : ActorMethod<
    [Principal, ProjectRequest, Array<TimelineRequest>],
    Result_2
  >,
  'updateProjectReward' : ActorMethod<[bigint, bigint], Result_1>,
  'updateProjectStatus' : ActorMethod<[bigint, ProjectStatus], Result_1>,
  'updateTimeline' : ActorMethod<[bigint, TimelineRequest], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
