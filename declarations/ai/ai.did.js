export const idlFactory = ({ IDL }) => {
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
  const TimelineRequest = IDL.Record({
    'title' : IDL.Text,
    'endDate' : IDL.Int,
    'startDate' : IDL.Int,
  });
  const TaskRequest = IDL.Record({
    'tag' : Tags,
    'title' : IDL.Text,
    'desc' : IDL.Text,
    'dueDate' : IDL.Int,
    'projectId' : IDL.Nat,
    'assignees' : IDL.Vec(IDL.Principal),
  });
  const ProjectId = IDL.Nat;
  const ResponseProjectPlanner = IDL.Record({
    'projectId' : IDL.Opt(ProjectId),
    'message' : IDL.Text,
  });
  const Result = IDL.Variant({
    'ok' : ResponseProjectPlanner,
    'err' : IDL.Text,
  });
  return IDL.Service({
    'projectPlanner' : IDL.Func(
        [
          IDL.Principal,
          ProjectRequest,
          IDL.Vec(TimelineRequest),
          IDL.Vec(TaskRequest),
        ],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
