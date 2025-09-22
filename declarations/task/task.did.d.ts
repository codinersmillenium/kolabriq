import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ProjectId = bigint;
export type Result = { 'ok' : Task } |
  { 'err' : string };
export type Result_1 = { 'ok' : Review } |
  { 'err' : string };
export type Result_2 = { 'ok' : Array<string> } |
  { 'err' : string };
export type Result_3 = { 'ok' : Array<UserOverview> } |
  { 'err' : string };
export type Result_4 = { 'ok' : Array<Review> } |
  { 'err' : string };
export type Result_5 = { 'ok' : Array<Task> } |
  { 'err' : null };
export type Result_6 = { 'ok' : Array<TaskBlock> } |
  { 'err' : string };
export interface Review {
  'id' : ReviewId,
  'review' : string,
  'action' : ReviewAction,
  'fixedById' : [] | [UserId],
  'reviewerId' : UserId,
  'taskId' : TaskId,
  'fixedAt' : [] | [bigint],
}
export type ReviewAction = { 'fix' : { 'fixedBy' : UserId } } |
  { 'create' : null } |
  { 'update' : { 'oldReview' : string, 'newReview' : string } };
export type ReviewId = bigint;
export type Tags = { 'ui' : null } |
  { 'frontend' : null } |
  { 'business_analyst' : null } |
  { 'backend' : null };
export interface Task {
  'id' : TaskId,
  'tag' : Tags,
  'status' : TaskStatus,
  'title' : string,
  'action' : TaskAction,
  'doneAt' : [] | [bigint],
  'desc' : string,
  'createdById' : UserId,
  'dueDate' : bigint,
  'projectId' : ProjectId,
  'doneById' : [] | [UserId],
  'priority' : boolean,
  'assignees' : Array<UserId>,
}
export type TaskAction = {
    'assigneeUpdate' : { 'added' : Array<UserId>, 'removed' : Array<UserId> }
  } |
  {
    'metadataUpdate' : {
      'field' : string,
      'oldValue' : string,
      'newValue' : string,
    }
  } |
  { 'create' : null } |
  { 'statusUpdate' : { 'to' : TaskStatus, 'from' : TaskStatus } };
export interface TaskBlock {
  'id' : bigint,
  'signature' : string,
  'data' : TaskBlockData,
  'hash' : string,
  'nonce' : bigint,
  'timestamp' : bigint,
  'previousHash' : string,
}
export type TaskBlockData = { 'review' : Review } |
  { 'task' : Task };
export interface TaskFilter {
  'tag' : [] | [Array<Tags>],
  'status' : [] | [Array<TaskStatus>],
  'keyword' : [] | [string],
}
export type TaskId = bigint;
export interface TaskRequest {
  'tag' : Tags,
  'title' : string,
  'desc' : string,
  'dueDate' : bigint,
  'projectId' : bigint,
  'assignees' : Array<Principal>,
}
export interface TaskReviewRequest { 'review' : string, 'taskId' : bigint }
export type TaskStatus = { 'done' : null } |
  { 'in_progress' : null } |
  { 'todo' : null };
export type UserId = Principal;
export interface UserOverview {
  'userId' : UserId,
  'totalOverdue' : bigint,
  'totalDone' : bigint,
  'totalTask' : bigint,
}
export interface _SERVICE {
  'addReview' : ActorMethod<[TaskReviewRequest], Result_1>,
  'createTask' : ActorMethod<[TaskRequest], Result>,
  'getReviewHistory' : ActorMethod<[bigint], Result_6>,
  'getTaskByKeyword' : ActorMethod<[bigint, string], Result>,
  'getTaskDetail' : ActorMethod<[bigint], Result>,
  'getTaskHistory' : ActorMethod<[bigint], Result_6>,
  'getTaskList' : ActorMethod<[bigint, [] | [TaskFilter]], Result_5>,
  'getTaskReviews' : ActorMethod<[bigint], Result_4>,
  'getUserOverview' : ActorMethod<[bigint], Result_3>,
  'healthCheck' : ActorMethod<
    [],
    {
      'totalTasks' : bigint,
      'lastBlockHash' : string,
      'totalBlocks' : bigint,
      'chainIntegrity' : boolean,
      'totalReviews' : bigint,
    }
  >,
  'projectAnalysis' : ActorMethod<[bigint], string>,
  'saveLlmTasks' : ActorMethod<
    [Principal, bigint, Array<TaskRequest>],
    Result_2
  >,
  'updateReview' : ActorMethod<[bigint, TaskReviewRequest], Result_1>,
  'updateReviewFixed' : ActorMethod<[bigint], Result_1>,
  'updateTaskMetadata' : ActorMethod<[bigint, TaskRequest], Result>,
  'updateTaskStatus' : ActorMethod<[bigint, TaskStatus], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
