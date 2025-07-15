import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Hash "mo:base/Hash";
import Array "mo:base/Array";

import TypContest "types";
import UtlDate "../utils/date";

module {
    public type StableContest         = (Nat, TypContest.Contest);
    public type StableContestBalances = (Nat, Nat);
    public type StablePrincipals      = (Principal, [Nat]);

    public class Contest(
        contestId           : Nat,
        dataContest         : [StableContest],
        dataContestBalances : [StableContestBalances],
        dataPrincipals      : [StablePrincipals],
    ) {
        public var nextContestId = contestId;

        public let contests = HashMap.HashMap<
            Nat,
            TypContest.Contest,
        >(dataContest.size(), Nat.equal, Hash.hash);

        public let contestBalances = HashMap.HashMap<
            Nat, // Id Contest.
            Nat, // Amount of tokens.
        >(dataContestBalances.size(), Nat.equal, Hash.hash);

        // TODO: ISSUES WHEN USER ADD ANOTHER CONTEST WILL BE OVERWRITE
        public let principals = HashMap.HashMap<
            Principal, 
            [Nat],
        >(dataPrincipals.size(), Principal.equal, Principal.hash);

        public func getNextContestId() : Nat {
            let contestId = nextContestId;
            nextContestId += 1;
            contestId;
        };

        public func getContests(filter : TypContest.ContestFilter) : [TypContest.Contest] {
            let data = Buffer.Buffer<TypContest.Contest>(0);
            for (value in contests.vals()) {
                let applyFilter : Bool = switch(filter) {
                    case (#all)         { true; };
                    case (#notComplete) { not value.isCompleted; };
                    case (#notStarted)  { value.startDate > UtlDate.now(); };
                    case (#onGoing)     { value.startDate <= UtlDate.now() and value.endDate >= UtlDate.now() and not value.isCompleted; };
                };

                if (applyFilter and value.publishDate >= UtlDate.now()) {
                    data.add(value);
                }
            };

            Buffer.toArray(data);
        };

        public func getContestsByPrincipal(principal : Principal) : [TypContest.Contest] {
            switch (principals.get(principal)) {
                case (null) { []; };
                case (?contestsId)  {
                    let data = Buffer.Buffer<TypContest.Contest>(0);
                    for(contestId in contestsId.vals()) {
                        switch(contests.get(contestId)) {
                            case (null)     {};
                            case (?contest) { data.add(contest); };
                        };
                    };
                    Buffer.toArray(data);
                };
            };
        };

        public func createContest(principal : Principal, req : TypContest.ContestRequest) : TypContest.Contest {
            let contest = {
                id                = getNextContestId();
                title             = req.title;
                description       = req.description;
                rewardToken       = req.rewardToken;
                startDate         = req.startDate;
                endDate           = req.endDate;
                limitParticipants = req.limitParticipants;
                publishDate       = req.publishDate;
                provider          = principal;
                isCompleted       = false;
                terms             = [];
            };

            putContest(contest);
            contestBalances.put(contest.id, contest.rewardToken);
            
            switch(principals.get(contest.provider)) {
                case (null) {
                    principals.put(contest.provider, [contest.id]);
                };
                case (?contestId) {
                    let appendContestantsId = Array.append<Nat>(contestId, [contest.id]);
                    principals.put(contest.provider, appendContestantsId);
                };
            };

            contest;
        };

        public func putContest(contest : TypContest.Contest) {
            contests.put(contest.id, contest);
        };

        public func getContestBalance(contestId : Nat) : Nat {
            switch(contestBalances.get(contestId)) {
                case (null)     { 0; };
                case (?balance) { balance; };
            };
        };
        
        public func expiredContest(contest : TypContest.Contest) : Bool {
            let balance = getContestBalance(contest.id);
            if (contest.endDate < UtlDate.now() or balance == 0) {
                return true;
            };

            false;
        };

        public func setExpiredContest(contest : TypContest.Contest) {
            let updatedContest : TypContest.Contest = {
                id                = contest.id;
                title             = contest.title;
                description       = contest.description;
                rewardToken       = contest.rewardToken;
                startDate         = contest.startDate;
                endDate           = contest.endDate;
                limitParticipants = contest.limitParticipants;
                provider          = contest.provider;
                publishDate       = contest.publishDate;
                isCompleted       = true;
                terms             = contest.terms;
            };

            putContest(updatedContest);
        };
    }
}