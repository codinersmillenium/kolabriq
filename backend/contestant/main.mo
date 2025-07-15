import Result "mo:base/Result";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";
import Iter "mo:base/Iter";

import SvcContestant "contestant";
import TypContestant "types";
import CntContest "canister:contest";
import UtlDate "../utils/date";

actor {
    private stable var nextContestantId : Nat                                            = 0;
    private stable var stableContestants : [SvcContestant.StableContestants]             = [];
    private stable var stableContestantDetails : [SvcContestant.StableContestantDetails] = [];
    private stable var stablePrincipals : [SvcContestant.StablePrincipals]               = [];
    private let contestants = SvcContestant.Contestant(nextContestantId, stableContestants, stableContestantDetails, stablePrincipals);

    public shared({caller}) func participate(contestId : Nat) : async Result.Result<Text, Text> {
        switch(await CntContest.getContest(contestId)) {
            case (#err(msg))    { return #err(msg); };
            case (#ok(contest)) {
                switch(contestants.getContestantByPrincipal(caller, contest.id)) {
                    case (null) {};
                    case (?_)   { return #err("Sudah tergabung dalam sayembara " # contest.title); };
                };

                if(contest.publishDate > UtlDate.now() or contest.startDate > UtlDate.now()) {
                    return #err("Sayembara " # contest.title # " belum dimulai");
                };
                
                let participants = contestants.getTotalParticipant(contest.id);
                let invalidContest : Bool = contest.endDate < UtlDate.now() or participants >= contest.limitParticipants or contest.isCompleted;

                if(invalidContest) {
                    return #err("Sayembara " # contest.title # " sudah tidak bisa diikuti lagi");
                };

                ignore contestants.createContestant(caller, contest);

                return #ok("Berhasil mengikuti sayembara " # contest.title);
            };
        }
    };

    public shared({caller}) func markTermComplete(termId : Nat) : async Result.Result<(), Text> {
        switch(await CntContest.getContestTerm(termId)) {
            case (#err(msg)) { return #err(msg); };
            case (#ok(term)) {
                switch(contestants.getContestantByPrincipal(caller, term.idContest)) {
                    case (null)        { return #err("Kontestan tidak ditemukan. Gagal menandai term: " # term.name # " telah selesai"); };
                    case (?contestant) {
                        switch(await CntContest.getContest(term.idContest)) {
                            case (#err(msg))    { return #err(msg); };
                            case (#ok(contest)) {
                                let invalidContest : Bool = contest.endDate < UtlDate.now() or contest.isCompleted;
                                
                                if(invalidContest) {
                                    return #err("Sayembara " # contest.title # " sudah tidak valid");
                                };

                                let contestantDetail : TypContestant.ContestantDetails = {
                                    id            = contestants.getNextContestantId();
                                    idContestant  = contestant.id;
                                    idTermContest = term.id;
                                    createdAt     = UtlDate.now();
                                };
                                
                                contestants.putContestantDetails(contestantDetail);

                                let termsId          = contestants.getTermsId(contest.terms);
                                let completedTermsId = contestants.getFinishedTerms(caller, contest.id);

                                if (Array.equal(termsId, completedTermsId, Nat.equal)) {
                                    let tokenAmount = contest.rewardToken / contest.limitParticipants;
                                    await CntContest.updateContestBalance(caller, contest.id, tokenAmount);
                                };

                                return #ok;
                            };
                        };
                    };
                };
            };
        };
    };

    public shared query({caller}) func myParticipant() : async Result.Result<[TypContestant.Contestant], ()> {
		#ok(contestants.getMyParticipation(caller));
	};

    public shared query({caller}) func getParticipation(contestantId : Nat) : async Result.Result<?TypContestant.Contestant, ()> {
		#ok(contestants.getContestantByPrincipal(caller, contestantId));
	};

    system func preupgrade() {
        stableContestants       := Iter.toArray(contestants.contestants.entries());
        stableContestantDetails := Iter.toArray(contestants.contestantDetails.entries());
        stablePrincipals        := Iter.toArray(contestants.principals.entries());
    };

    system func postupgrade() {
        stableContestants       := [];
        stableContestantDetails := [];
        stablePrincipals        := [];
    };
}