import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Buffer "mo:base/Buffer";

import TypContest "types";

module {
    public type StableContestTerms = (
        Nat,
        TypContest.ContestTerms,
    );

    public func toStable(contests : ContestTerms) : [StableContestTerms] {
        Iter.toArray(contests.contestTerms.entries());
    };
    
    public class ContestTerms(
        contestId : Nat,
        data      : [StableContestTerms],
    ) {
        public var nextContestTermsId = contestId;

        public let contestTerms = HashMap.HashMap<
            Nat,
            TypContest.ContestTerms,
        >(data.size(), Nat.equal, Hash.hash);

        public func getNextContestTermsId() : Nat {
            let contestTermsId = nextContestTermsId;
            nextContestTermsId += 1;
            contestTermsId;
        };

        public func getTermsByContestId(contestId : Nat) : [TypContest.ContestTerms] {
            let data = Buffer.Buffer<TypContest.ContestTerms>(0);
            for ((key, value) in contestTerms.entries()) {
                if (value.idContest == contestId) {
                    data.add(value);
                };
            };
            Buffer.toArray(data);
        };

        public func createContestTerms(req : TypContest.ContestTermsRequest) : TypContest.ContestTerms {
            let term : TypContest.ContestTerms = {
                id        = getNextContestTermsId();
                idContest = req.idContest;
                name      = req.name;
                description = req.description;
                follow    = req.follow;
                followType = req.followType;
            };

            contestTerms.put(term.id, term);
            term;
        };
    }
}