export const idlFactory = ({ IDL }) => {
  const TaskReviewRequest = IDL.Record({
    'review' : IDL.Text,
    'taskId' : IDL.Nat,
  });
  const ReviewId = IDL.Nat;
  const UserId = IDL.Principal;
  const ReviewAction = IDL.Variant({
    'fix' : IDL.Record({ 'fixedBy' : UserId }),
    'create' : IDL.Null,
    'update' : IDL.Record({ 'oldReview' : IDL.Text, 'newReview' : IDL.Text }),
  });
  const TaskId = IDL.Nat;
  const Review = IDL.Record({
    'id' : ReviewId,
    'review' : IDL.Text,
    'action' : ReviewAction,
    'fixedById' : IDL.Opt(UserId),
    'reviewerId' : UserId,
    'taskId' : TaskId,
    'fixedAt' : IDL.Opt(IDL.Int),
  });
  const Result_1 = IDL.Variant({ 'ok' : Review, 'err' : IDL.Text });
  const Tags = IDL.Variant({
    'ui' : IDL.Null,
    'frontend' : IDL.Null,
    'business_analyst' : IDL.Null,
    'backend' : IDL.Null,
  });
  const TaskRequest = IDL.Record({
    'tag' : Tags,
    'title' : IDL.Text,
    'desc' : IDL.Text,
    'dueDate' : IDL.Int,
    'projectId' : IDL.Nat,
    'assignees' : IDL.Vec(IDL.Principal),
  });
  const TaskStatus = IDL.Variant({
    'done' : IDL.Null,
    'in_progress' : IDL.Null,
    'todo' : IDL.Null,
  });
  const TaskAction = IDL.Variant({
    'assigneeUpdate' : IDL.Record({
      'added' : IDL.Vec(UserId),
      'removed' : IDL.Vec(UserId),
    }),
    'metadataUpdate' : IDL.Record({
      'field' : IDL.Text,
      'oldValue' : IDL.Text,
      'newValue' : IDL.Text,
    }),
    'create' : IDL.Null,
    'statusUpdate' : IDL.Record({ 'to' : TaskStatus, 'from' : TaskStatus }),
  });
  const ProjectId = IDL.Nat;
  const Task = IDL.Record({
    'id' : TaskId,
    'tag' : Tags,
    'status' : TaskStatus,
    'title' : IDL.Text,
    'action' : TaskAction,
    'doneAt' : IDL.Opt(IDL.Int),
    'desc' : IDL.Text,
    'createdById' : UserId,
    'dueDate' : IDL.Int,
    'projectId' : ProjectId,
    'doneById' : IDL.Opt(UserId),
    'priority' : IDL.Bool,
    'assignees' : IDL.Vec(UserId),
  });
  const Result = IDL.Variant({ 'ok' : Task, 'err' : IDL.Text });
  const TaskBlockData = IDL.Variant({ 'review' : Review, 'task' : Task });
  const TaskBlock = IDL.Record({
    'id' : IDL.Nat,
    'signature' : IDL.Text,
    'data' : TaskBlockData,
    'hash' : IDL.Text,
    'nonce' : IDL.Nat,
    'timestamp' : IDL.Int,
    'previousHash' : IDL.Text,
  });
  const Result_6 = IDL.Variant({ 'ok' : IDL.Vec(TaskBlock), 'err' : IDL.Text });
  const TaskFilter = IDL.Record({
    'tag' : IDL.Opt(IDL.Vec(Tags)),
    'status' : IDL.Opt(IDL.Vec(TaskStatus)),
    'keyword' : IDL.Opt(IDL.Text),
  });
  const Result_5 = IDL.Variant({ 'ok' : IDL.Vec(Task), 'err' : IDL.Null });
  const Result_4 = IDL.Variant({ 'ok' : IDL.Vec(Review), 'err' : IDL.Text });
  const UserOverview = IDL.Record({
    'userId' : UserId,
    'totalOverdue' : IDL.Nat,
    'totalDone' : IDL.Nat,
    'totalTask' : IDL.Nat,
  });
  const Result_3 = IDL.Variant({
    'ok' : IDL.Vec(UserOverview),
    'err' : IDL.Text,
  });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Vec(IDL.Text), 'err' : IDL.Text });
  return IDL.Service({
    'addReview' : IDL.Func([TaskReviewRequest], [Result_1], []),
    'createTask' : IDL.Func([TaskRequest], [Result], []),
    'getReviewHistory' : IDL.Func([IDL.Nat], [Result_6], ['query']),
    'getTaskByKeyword' : IDL.Func([IDL.Nat, IDL.Text], [Result], ['query']),
    'getTaskDetail' : IDL.Func([IDL.Nat], [Result], ['query']),
    'getTaskHistory' : IDL.Func([IDL.Nat], [Result_6], ['query']),
    'getTaskList' : IDL.Func(
        [IDL.Nat, IDL.Opt(TaskFilter)],
        [Result_5],
        ['query'],
      ),
    'getTaskReviews' : IDL.Func([IDL.Nat], [Result_4], ['query']),
    'getUserOverview' : IDL.Func([IDL.Nat], [Result_3], ['query']),
    'healthCheck' : IDL.Func(
        [],
        [
          IDL.Record({
            'totalTasks' : IDL.Nat,
            'lastBlockHash' : IDL.Text,
            'totalBlocks' : IDL.Nat,
            'chainIntegrity' : IDL.Bool,
            'totalReviews' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'projectAnalysis' : IDL.Func([IDL.Nat], [IDL.Text], ['query']),
    'saveLlmTasks' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Vec(TaskRequest)],
        [Result_2],
        [],
      ),
    'updateReview' : IDL.Func([IDL.Nat, TaskReviewRequest], [Result_1], []),
    'updateReviewFixed' : IDL.Func([IDL.Nat], [Result_1], []),
    'updateTaskMetadata' : IDL.Func([IDL.Nat, TaskRequest], [Result], []),
    'updateTaskStatus' : IDL.Func([IDL.Nat, TaskStatus], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
