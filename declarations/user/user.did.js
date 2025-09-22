export const idlFactory = ({ IDL }) => {
  const Result_4 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const UserId = IDL.Principal;
  const AuthAction = IDL.Variant({
    'sessionExpired' : IDL.Null,
    'logout' : IDL.Null,
    'login' : IDL.Null,
  });
  const Role = IDL.Variant({
    'admin' : IDL.Null,
    'maintainer' : IDL.Null,
    'developer' : IDL.Null,
  });
  const Plan = IDL.Variant({ 'pro' : IDL.Null, 'basic' : IDL.Null });
  const UserProfileAction = IDL.Variant({
    'authentication' : IDL.Record({
      'loginTime' : IDL.Int,
      'action' : AuthAction,
    }),
    'updateName' : IDL.Record({
      'newFirst' : IDL.Text,
      'oldFirst' : IDL.Text,
      'newLast' : IDL.Text,
      'oldLast' : IDL.Text,
    }),
    'updateRole' : IDL.Record({ 'oldRole' : Role, 'newRole' : Role }),
    'planUpgrade' : IDL.Record({ 'newPlan' : Plan, 'oldPlan' : Plan }),
    'registration' : IDL.Null,
  });
  const Tags = IDL.Variant({
    'ui' : IDL.Null,
    'frontend' : IDL.Null,
    'business_analyst' : IDL.Null,
    'backend' : IDL.Null,
  });
  const UserProfile = IDL.Record({
    'id' : UserId,
    'userName' : IDL.Text,
    'action' : UserProfileAction,
    'referrerCode' : IDL.Opt(IDL.Text),
    'plan_type' : Plan,
    'role' : Role,
    'tags' : IDL.Vec(Tags),
    'personalRefCode' : IDL.Text,
    'lastName' : IDL.Text,
    'firstName' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : UserProfile, 'err' : IDL.Text });
  const BlockId = IDL.Nat;
  const UserBlock = IDL.Record({
    'id' : BlockId,
    'signature' : IDL.Text,
    'data' : UserProfile,
    'hash' : IDL.Text,
    'nonce' : IDL.Nat,
    'timestamp' : IDL.Int,
    'previousHash' : IDL.Text,
  });
  const Result_3 = IDL.Variant({ 'ok' : IDL.Vec(UserBlock), 'err' : IDL.Text });
  const UserFilter = IDL.Record({
    'tags' : IDL.Opt(IDL.Vec(Tags)),
    'keyword' : IDL.Opt(IDL.Text),
    'roles' : IDL.Opt(IDL.Vec(Role)),
  });
  const Result_2 = IDL.Variant({
    'ok' : IDL.Vec(UserProfile),
    'err' : IDL.Null,
  });
  const Result_1 = IDL.Variant({
    'ok' : IDL.Vec(UserProfile),
    'err' : IDL.Text,
  });
  const UserRequest = IDL.Record({
    'userName' : IDL.Text,
    'referrerCode' : IDL.Opt(IDL.Text),
    'role' : Role,
    'tags' : IDL.Vec(Tags),
    'lastName' : IDL.Text,
    'firstName' : IDL.Text,
  });
  return IDL.Service({
    'checkPrincipal' : IDL.Func([], [IDL.Principal], ['query']),
    'getTeamRefCode' : IDL.Func([], [Result_4], ['query']),
    'getUserDetail' : IDL.Func([IDL.Principal], [Result], ['query']),
    'getUserHistory' : IDL.Func([IDL.Principal], [Result_3], ['query']),
    'getUserList' : IDL.Func([UserFilter], [Result_2], ['query']),
    'getUsersByIds' : IDL.Func([IDL.Vec(IDL.Principal)], [Result_1], ['query']),
    'healthCheck' : IDL.Func(
        [],
        [
          IDL.Record({
            'lastBlockHash' : IDL.Text,
            'totalBlocks' : IDL.Nat,
            'chainIntegrity' : IDL.Bool,
            'totalUsers' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'login' : IDL.Func([], [Result], []),
    'logout' : IDL.Func([], [Result], []),
    'registerUser' : IDL.Func([UserRequest], [Result], []),
    'updateRole' : IDL.Func([IDL.Principal, Role], [Result], []),
    'updateUser' : IDL.Func([UserRequest], [Result], []),
    'upgradePlan' : IDL.Func([Plan], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
