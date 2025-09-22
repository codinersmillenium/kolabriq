export const idlFactory = ({ IDL }) => {
  const UserId = IDL.Principal;
  const PayoutTeam = IDL.Record({ 'token' : IDL.Nat, 'userId' : UserId });
  return IDL.Service({
    'balanceOf' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'buyIn' : IDL.Func([IDL.Nat], [IDL.Nat], []),
    'name' : IDL.Func([], [IDL.Text], ['query']),
    'symbol' : IDL.Func([], [IDL.Text], ['query']),
    'teamPayout' : IDL.Func([IDL.Vec(PayoutTeam)], [IDL.Bool], []),
    'updateBalance' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
