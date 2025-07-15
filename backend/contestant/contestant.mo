import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";

import TypContestant "types";
import TypContest "../contest/types";

module {
    public type StableContestants       = (Nat, TypContestant.Contestant);
    public type StableContestantDetails = (Nat, TypContestant.ContestantDetails);
    public type StablePrincipals        = (Principal, [Nat]);

    public class Contestant(
        contestantId          : Nat,
        dataContestants       : [StableContestants],
        dataContestantDetails : [StableContestantDetails],
        dataPrincipals        : [StablePrincipals],
    ) {
        public var nextContestantId = contestantId;

        public let contestants = HashMap.HashMap<
            Nat,
            TypContestant.Contestant,
        >(dataContestants.size(), Nat.equal, Hash.hash);

        public let contestantDetails = HashMap.HashMap<
            Nat,
            TypContestant.ContestantDetails,
        >(dataContestantDetails.size(), Nat.equal, Hash.hash);

        public let principals = HashMap.HashMap<
            Principal,
            [Nat],
        >(dataPrincipals.size(), Principal.equal, Principal.hash);

        public func getNextContestantId() : Nat {
            let contestantId = nextContestantId;
            nextContestantId += 1;
            contestantId;
        };

        public func getContestantByPrincipal(principal : Principal, contestId : Nat) : ?TypContestant.Contestant {
            for (value in contestants.vals()) {
                if (value.idContest == contestId and value.idUser == principal) {
					let details = getContestantDetailsByContestant(principal, value.id);
					let contestant : TypContestant.Contestant = {
						id 		  = value.id;
						idUser    = value.idUser;
						idContest = value.idContest;
						status    = value.status;
						endDate   = value.endDate;
						details   = details;
					};
					
                    return ?contestant;
                };
            };

            return null;
        };

        public func getTotalParticipant(contestId : Nat) : Nat {
            let participant = Buffer.Buffer<TypContestant.Contestant>(0);
            for (value in contestants.vals()) {
                if (value.idContest == contestId) {
                    participant.add(value);
                };
            };

            return participant.size();
        };

        public func getContestantDetailsByContestant(principal : Principal, contestantId : Nat) : [TypContestant.ContestantDetails] {
            let data = Buffer.Buffer<TypContestant.ContestantDetails>(0);
            for (value in contestantDetails.vals()) {
                if (value.idContestant == contestantId) {
                    switch(contestants.get(contestantId)) {
                        case(null)        {};
                        case(?contestant) {
                            if (contestant.idUser == principal) {
                                data.add(value);
                            }
                        };
                    };
                };
            };
            Buffer.toArray(data);
        };

        public func getFinishedTerms(principal : Principal, contestId : Nat) : [Nat] {
            let data = Buffer.Buffer<Nat>(0);
            for (contestant in contestants.vals()) {
                if (contestant.idUser == principal and contestant.idContest == contestId) {
                    for (detail in contestantDetails.vals()) {
                        if (detail.idContestant == contestant.id) {
                            data.add(detail.idTermContest);
                        }
                    }
                }
            };
            data.sort(Nat.compare);
            Buffer.toArray(data);
        };

        public func getTermsId(terms : [TypContest.ContestTerms]) : [Nat] {
            let data = Buffer.Buffer<Nat>(0);
            for (term in terms.vals()) {
                data.add(term.id);
            };
            data.sort(Nat.compare);
            Buffer.toArray(data);
        };

        public func createContestant(principal : Principal, contest : TypContest.Contest) : TypContestant.Contestant {
            let contestant = {
                id        = getNextContestantId();
                idUser    = principal;
                idContest = contest.id;
                endDate   = contest.endDate;
                status    = true;
                active 	  = true;
                details   = [];
            };

            putContestant(contestant);
            contestant;
        };

        public func putContestant(contestant : TypContestant.Contestant) {
            contestants.put(contestant.id, contestant);
            switch(principals.get(contestant.idUser)) {
                case (null) {
                    principals.put(contestant.idUser, [contestant.id]);
                };
                case (?contestantsId) {
                    let appendContestantsId = Array.append<Nat>(contestantsId, [contestant.id]);
                    principals.put(contestant.idUser, appendContestantsId);
                };
            }
        };

        public func putContestantDetails(detail : TypContestant.ContestantDetails) {
            contestantDetails.put(detail.id, detail);
        };

        public func getMyParticipation(principal : Principal) : [TypContestant.Contestant] {
            let data = Buffer.Buffer<TypContestant.Contestant>(0);
            for (value in contestants.vals()) {
                let details = getContestantDetailsByContestant(principal, value.id);
                let contestant : TypContestant.Contestant = {
                    id 		  = value.id;
                    idUser    = value.idUser;
                    idContest = value.idContest;
                    status    = value.status;
                    endDate   = value.endDate;
                    details   = details;
                };

                data.add(contestant);
            };

            Buffer.toArray(data);
        };
    }
}