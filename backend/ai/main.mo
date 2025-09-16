import Text "mo:base/Text";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Result "mo:base/Result";

import TypCommon "../common/type";
import TypProject "../project/type";
import TypTask "../task/type";

import CanTask "canister:task";
import CanProject "canister:project";

persistent actor {
	type ResponseProjectPlanner = {
		message   : Text;
		projectId : ?TypCommon.ProjectId;
	};

	/**
	* MARK: Project planner
	* 
	* Some parameter fill with dummy data, for effecienty resource run llm
	*/ 
	public func projectPlanner(
        caller       : TypCommon.UserId,
		reqProject   : TypProject.ProjectRequest,
        reqTimelines : [TypProject.TimelineRequest],
		reqTasks     : [TypTask.TaskRequest],
	) : async Result.Result<ResponseProjectPlanner, Text> {
		let projectResponse = await CanProject.saveLlmProjectTimelines(caller, reqProject, reqTimelines);
		switch (projectResponse) {
			case (#err(_))  { return #err("The project and its timelines could not be created because the blockchain integrity was compromised. Please rephrase this into a clear user-facing error message."); };
			case (#ok(res)) {
				let taskResponse = await CanTask.saveLlmTasks(caller, res.project.id, reqTasks);
				switch (taskResponse) {
					case (#err(_)) { return #err("The tasks could not be created because the blockchain integrity was compromised. Please rephrase this into a clear user-facing error message."); };
					case (#ok(_))  {
						return #ok({
							message = 
								"Project **" # res.project.name # "** has been successfully created. " #
								"It includes " # Nat.toText(reqTasks.size()) # " tasks, scheduled from epoch " #
								Int.toText(res.startDate) # " to " # Int.toText(res.endDate) # ". " #
								"Please calculate how many days this project will take based on those epochs, " #
								"and include the estimated duration in the summary for the user.";
							projectId = ?res.project.id;
						});
					};
				};
			};
		};

		
	};
};
