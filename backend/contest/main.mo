import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";

import SvcContest "contest";
import SvcContestTerm "contest_term";
import TypContest "types";
import CntToken "canister:token";
import UtlDate "../utils/date";

actor {
	private stable var nextContestId : Nat                                        = 0;
	private stable var stableContests : [SvcContest.StableContest]                = [];
	private stable var stableContestBalances : [SvcContest.StableContestBalances] = [];
	private stable var stablePrincipals : [SvcContest.StablePrincipals]           = [];
	private let contests = SvcContest.Contest(nextContestId, stableContests, stableContestBalances, stablePrincipals);
    private let followType: [TypContest.ContestTermFollowType] = [{id = 0; name = "twitter";}]; // default temp

    public shared({caller}) func addBalance() : async () {
        let balance = await CntToken.balanceOf(caller);
        await CntToken.updateBalance(caller, balance + 100);
	};

	public query func getfollowType() : async Result.Result<[TypContest.ContestTermFollowType], ()> {
        return #ok(followType);
    };

    public query func getAllContests(filter : TypContest.ContestFilter) : async Result.Result<[TypContest.Contest], ()> {
        return #ok(contests.getContests(filter));
    };

	public shared func getContest(contestId : Nat) : async Result.Result<TypContest.Contest, Text> {
		switch (contests.contests.get(contestId)) {
            case (null)     { #err("Data sayembara tidak ditemukan"); };
            case (?contest) { 
                let newContest : TypContest.Contest = {
                    id                = contest.id;
                    title             = contest.title;
                    description       = contest.description;
                    rewardToken       = contest.rewardToken;
                    startDate         = contest.startDate;
                    endDate           = contest.endDate;
                    limitParticipants = contest.limitParticipants;
                    provider          = contest.provider;
                    publishDate       = contest.publishDate;
                    isCompleted       = contest.isCompleted;
                    terms             = contestTerms.getTermsByContestId(contest.id);
                };

                #ok(newContest); 
			};
        };
	};

    public shared({caller}) func createContest(req : TypContest.ContestRequest) : async Result.Result<TypContest.Contest, Text> {
        let balance = await CntToken.balanceOf(caller);
        if (balance < req.rewardToken) {
            return #err("Token tidak mencukupi")
        };
        
        let contest = contests.createContest(caller, req);
        ignore CntToken.updateBalance(caller, balance - req.rewardToken);
        
        #ok(contest);
	};

    public shared func updateContestBalance(principal : Principal, contestId : Nat, amount : Nat) : async() {
        switch(contests.contestBalances.get(contestId)) {
            case (null) {};
            case (?balance) {
                let updatedBalance : Nat = balance - amount;
                ignore CntToken.updateBalance(principal, amount);

                contests.contestBalances.put(contestId, updatedBalance);

                if (updatedBalance == 0) {
                    switch (await getContest(contestId)) {
                        case(#err(_))      {};
                        case(#ok(contest)) {
                            contests.setExpiredContest(contest);
                        };
                    };
                }
            };
        };
        
        return;
    };

    public query func getContestBalance(contestId : Nat) : async Result.Result<Nat, ()> {
        #ok(contests.getContestBalance(contestId));
	};

    public query({caller}) func getMyContests() : async Result.Result<[TypContest.Contest], ()> {
        #ok(contests.getContestsByPrincipal(caller));
    };

    public shared({caller}) func publishContest(contestId : Nat) : async Result.Result<Text, Text> {
        switch (contests.contests.get(contestId)) {
            case (null)     { #err("Data sayembara tidak ditemukan"); };
            case (?contest) { 
                if (contest.provider != caller) {
                    return #err("Proses tidak diizinkan");
                };

                let updatedContest : TypContest.Contest = {
                    id                = contest.id;
                    title             = contest.title;
                    description       = contest.description;
                    rewardToken       = contest.rewardToken;
                    startDate         = contest.startDate;
                    endDate           = contest.endDate;
                    limitParticipants = contest.limitParticipants;
                    provider          = contest.provider;
                    publishDate       = UtlDate.now();
                    isCompleted       = contest.isCompleted;
                    terms             = contestTerms.getTermsByContestId(contest.id);
                };

                contests.putContest(updatedContest);
                #ok("Berhasil publish sayembara " # updatedContest.title); 
			};
        };
	};

    public func syncContests() : async () {
        for (value in contests.contests.vals()) {
            if (contests.expiredContest(value)) {
                contests.setExpiredContest(value);
            }
        };
    };

    // MARK: CONTEST TERM

    private stable var nextContestTermsId : Nat                                 = 0;
	private stable var stableContestTerms : [SvcContestTerm.StableContestTerms] = [];
	private let contestTerms = SvcContestTerm.ContestTerms(nextContestTermsId, stableContestTerms);

	public shared query func getContestTerm(contestTermId : Nat) : async Result.Result<TypContest.ContestTerms, Text> {
		switch (contestTerms.contestTerms.get(contestTermId)) {
            case (null)    { #err("Data term tidak ditemukan"); };
            case (? term)  { #ok(term); };
        };
	};

	public shared query func getContestTermsByParent(contestId : Nat) : async Result.Result<[TypContest.ContestTerms], ()> {
		#ok(contestTerms.getTermsByContestId(contestId));
	};

    public func createContestTerm(req : TypContest.ContestTermsRequest) : async Result.Result<TypContest.ContestTerms, Text> {
        switch (contests.contests.get(req.idContest)) {
            case (null) { #err("Data sayembara tidak ditemukan"); };
            case (?_)   { #ok(contestTerms.createContestTerms(req)); };
        };
	};

    // MARK: SYSTEM

    system func preupgrade() {
        stableContests        := Iter.toArray(contests.contests.entries());
        stableContestBalances := Iter.toArray(contests.contestBalances.entries());
        stablePrincipals      := Iter.toArray(contests.principals.entries());
    };

    system func postupgrade() {
        stableContests        := [];
        stableContestBalances := [];
        stablePrincipals      := [];
    };
};