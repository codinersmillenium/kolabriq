export const idlFactory = ({ IDL }) => {
  const Result_7 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const ProjectType = IDL.Variant({ 'free' : IDL.Null, 'rewarded' : IDL.Null });
  const Tags = IDL.Variant({
    'ui' : IDL.Null,
    'frontend' : IDL.Null,
    'business_analyst' : IDL.Null,
    'backend' : IDL.Null,
  });
  const ProjectRequest = IDL.Record({
    'reward' : IDL.Nat,
    'thumbnail' : IDL.Vec(IDL.Nat8),
    'projectType' : ProjectType,
    'desc' : IDL.Text,
    'name' : IDL.Text,
    'tags' : IDL.Vec(Tags),
  });
  const ProjectId = IDL.Nat;
  const ProjectStatus = IDL.Variant({
    'new' : IDL.Null,
    'review' : IDL.Null,
    'done' : IDL.Null,
    'in_progress' : IDL.Null,
  });
  const ProjectAction = IDL.Variant({
    'metadataUpdate' : IDL.Record({
      'field' : IDL.Text,
      'oldValue' : IDL.Text,
      'newValue' : IDL.Text,
    }),
    'create' : IDL.Null,
    'rewardUpdate' : IDL.Record({ 'to' : IDL.Nat, 'from' : IDL.Nat }),
    'statusUpdate' : IDL.Record({
      'to' : ProjectStatus,
      'from' : ProjectStatus,
    }),
  });
  const UserId = IDL.Principal;
  const Project = IDL.Record({
    'id' : ProjectId,
    'status' : ProjectStatus,
    'reward' : IDL.Nat,
    'action' : ProjectAction,
    'thumbnail' : IDL.Vec(IDL.Nat8),
    'projectType' : ProjectType,
    'ownerId' : UserId,
    'desc' : IDL.Text,
    'name' : IDL.Text,
    'createdBy' : UserId,
    'tags' : IDL.Vec(Tags),
  });
  const Result_1 = IDL.Variant({ 'ok' : Project, 'err' : IDL.Text });
  const TimelineRequest = IDL.Record({
    'title' : IDL.Text,
    'endDate' : IDL.Int,
    'startDate' : IDL.Int,
  });
  const TimelineId = IDL.Nat;
  const TimelineAction = IDL.Variant({
    'dateUpdate' : IDL.Record({
      'field' : IDL.Text,
      'oldValue' : IDL.Int,
      'newValue' : IDL.Int,
    }),
    'metadataUpdate' : IDL.Record({
      'field' : IDL.Text,
      'oldValue' : IDL.Text,
      'newValue' : IDL.Text,
    }),
    'create' : IDL.Null,
  });
  const Timeline = IDL.Record({
    'id' : TimelineId,
    'title' : IDL.Text,
    'action' : TimelineAction,
    'endDate' : IDL.Int,
    'createdBy' : UserId,
    'projectId' : ProjectId,
    'startDate' : IDL.Int,
  });
  const Result = IDL.Variant({ 'ok' : Timeline, 'err' : IDL.Text });
  const ProjectFilter = IDL.Record({
    'status' : IDL.Opt(ProjectStatus),
    'projectType' : IDL.Opt(ProjectType),
    'tags' : IDL.Opt(IDL.Vec(Tags)),
    'keyword' : IDL.Opt(IDL.Text),
  });
  const Result_6 = IDL.Variant({ 'ok' : IDL.Vec(Project), 'err' : IDL.Null });
  const BlockId = IDL.Nat;
  const TeamAction = IDL.Variant({
    'assign' : IDL.Null,
    'unassign' : IDL.Null,
  });
  const TeamAssignment = IDL.Record({
    'action' : TeamAction,
    'assignedBy' : UserId,
    'userId' : UserId,
    'projectId' : ProjectId,
  });
  const ProjectBlockData = IDL.Variant({
    'teamAssignment' : TeamAssignment,
    'project' : Project,
    'timeline' : Timeline,
  });
  const ProjectBlock = IDL.Record({
    'id' : BlockId,
    'signature' : IDL.Text,
    'data' : ProjectBlockData,
    'hash' : IDL.Text,
    'nonce' : IDL.Nat,
    'timestamp' : IDL.Int,
    'previousHash' : IDL.Text,
  });
  const Result_3 = IDL.Variant({
    'ok' : IDL.Vec(ProjectBlock),
    'err' : IDL.Text,
  });
  const Result_5 = IDL.Variant({ 'ok' : IDL.Vec(UserId), 'err' : IDL.Text });
  const Result_4 = IDL.Variant({ 'ok' : IDL.Vec(Timeline), 'err' : IDL.Text });
  const LLMSaveResponse = IDL.Record({
    'endDate' : IDL.Int,
    'project' : Project,
    'startDate' : IDL.Int,
  });
  const Result_2 = IDL.Variant({ 'ok' : LLMSaveResponse, 'err' : IDL.Text });
  return IDL.Service({
    'assignProjectTeam' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Vec(IDL.Principal)],
        [Result_7],
        [],
      ),
    'createProject' : IDL.Func([IDL.Text, ProjectRequest], [Result_1], []),
    'createTimeline' : IDL.Func([IDL.Nat, TimelineRequest], [Result], []),
    'getOwnedProjectList' : IDL.Func(
        [IDL.Text, ProjectFilter],
        [Result_6],
        ['query'],
      ),
    'getProjectByKeyword' : IDL.Func(
        [IDL.Text, IDL.Text],
        [Result_1],
        ['query'],
      ),
    'getProjectDetail' : IDL.Func([IDL.Nat], [Result_1], ['query']),
    'getProjectHistory' : IDL.Func([IDL.Nat], [Result_3], ['query']),
    'getProjectTeam' : IDL.Func([IDL.Nat], [Result_5], ['query']),
    'getProjectTimelines' : IDL.Func([IDL.Nat], [Result_4], ['query']),
    'getTimelineDetail' : IDL.Func([IDL.Nat], [Result], ['query']),
    'getTimelineHistory' : IDL.Func([IDL.Nat], [Result_3], ['query']),
    'healthCheck' : IDL.Func(
        [],
        [
          IDL.Record({
            'lastBlockHash' : IDL.Text,
            'totalTimelines' : IDL.Nat,
            'totalProjects' : IDL.Nat,
            'totalBlocks' : IDL.Nat,
            'chainIntegrity' : IDL.Bool,
          }),
        ],
        ['query'],
      ),
    'saveLlmProjectTimelines' : IDL.Func(
        [IDL.Principal, ProjectRequest, IDL.Vec(TimelineRequest)],
        [Result_2],
        [],
      ),
    'updateProjectReward' : IDL.Func([IDL.Nat, IDL.Nat], [Result_1], []),
    'updateProjectStatus' : IDL.Func([IDL.Nat, ProjectStatus], [Result_1], []),
    'updateTimeline' : IDL.Func([IDL.Nat, TimelineRequest], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
