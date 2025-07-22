import LLM "mo:llm";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Int "mo:base/Int";
import Rand "mo:random/Rand";

import TypCommon "../common/type";
import TypProject "../project/type";
import TypTask "../task/type";
import TypUser "../user/type";
import TypAi "type";

import UtlCommon "../common/util";
import UtlDate "../utils/date";
import Utl "../utils/helper";

import CanTask "canister:task";
import CanProject "canister:project";

import Prompt "prompt";

actor {
	/**
	* MARK: Project planner
	* 
	* Some parameter fill with dummy data, for effecienty resource run llm
	*/ 

	public func planProject(projectTheme : Text) : async ?TypAi.ResponseProjectLLM {
		// Tags should be according TypCommon.Tags
		let projectTags = ["backend", "bussines_analist", "frontend", "ui"];
		let tools = [
			LLM.tool("project_planner")
				.withDescription("Project planner: create a project theme, 2 tasks, and 2 timelines. Each task uses | as field separator.")
				.withParameter(
					LLM.parameter("project:name", #String)
						.withDescription("Short project name that captures the idea.")
						.isRequired()
				)
				.withParameter(
					LLM.parameter("project:tags", #String)
						.withEnumValues(projectTags)
						.withDescription("Tag to describe project focus.")
						.isRequired()
				)
				.withParameter(
					LLM.parameter("task:title", #String)
						.withDescription("Multiple task titles, simple and related to project.")
						.isRequired()
				)
				.withParameter(
					LLM.parameter("task:tag", #String)
						.withDescription("Task tag for assigning users, based on title.")
						.isRequired()
				)
				.withParameter(
					LLM.parameter("timeline:title", #String)
						.withDescription("Timeline phase title.")
						.isRequired()
				)
				.build(),
		];

		let response = await LLM.chat(#Llama3_1_8B).withMessages([
			#user({ content = projectTheme }),
		]).withTools(tools).send();

		let toolCalls = response.message.tool_calls;

		if (toolCalls.size() > 0) {
			let toolCall  = toolCalls[0];
			let arguments = toolCall.function.arguments;

			// Find the account parameter
			var projectName   = "";
			var projectTags   = "";
			var taskTitle     = "";
			var taskTag       = "";
			var timelineTitle = "";

			for (arg in arguments.vals()) {
				switch (arg.name) {
					case ("project:name")   { projectName := arg.value };
					case ("project:tags")   { projectTags := arg.value };
					case ("task:title")     { taskTitle := arg.value };
					case ("task:tag")       { taskTag := arg.value };
					case ("timeline:title") { timelineTitle := arg.value };
					case (_) {};
				};
			};

			Debug.print(projectName);
			Debug.print(projectTags);
			Debug.print(taskTitle);
			Debug.print(taskTag);
			Debug.print(timelineTitle);

			let project : TypProject.ProjectResponseFromLLM = {
				name = projectName;
				tags = Iter.toArray(
					Iter.map(
						Text.split(projectTags, #char '|'),
						func(tag : Text) : TypCommon.Tags {
							UtlCommon.tagsFromString(tag);
						},
					)
				);
			};

			var tasks : [TypTask.TaskResponseFromLLM] = [];
			var splitTitle : [Text] = Iter.toArray(Text.split(taskTitle, #char '|'));
			var splitTag   : [Text] = Iter.toArray(Text.split(taskTag, #char '|'));
			let totalTasks : Int    = Int.min(Utl.natToInt(splitTitle.size()), Utl.natToInt(splitTag.size()));

			for (i in Iter.range(1, totalTasks)) {
				let rand : Int = await Rand.Rand().randRange(2, 5);
				let data : TypTask.TaskResponseFromLLM = {
					title       = splitTitle[i];
					description = splitTitle[i]; // dummy purpose
					taskTag     = UtlCommon.tagsFromString(splitTag[i]);
					dueDate     = UtlDate.addDate(rand); // dummy purpose
					priority    = rand % 2 == 0; // dummy purpose
				};

				tasks := Array.append<TypTask.TaskResponseFromLLM>(tasks, [data]);
			};

			var timelines : [TypProject.TimelineResponseFromLLM] = [];
			var splitTimelineTitle : [Text] = Iter.toArray(Text.split(timelineTitle, #char '|'));
			let totalTimelines : Int = splitTimelineTitle.size();

			for (i in Iter.range(1, totalTimelines)) {
				let data : TypProject.TimelineResponseFromLLM = {
					title     = splitTimelineTitle[i];
					startDate = UtlDate.addDate(await Rand.Rand().randRange(1, 3));
					endDate   = UtlDate.addDate(await Rand.Rand().randRange(4, 6));
				};

				timelines := Array.append<TypProject.TimelineResponseFromLLM>(timelines, [data]);
			};

			let result : TypAi.ResponseProjectLLM = {
				project   = project;
				tasks     = tasks;
				timelines = timelines;
			};

			return ?result;
		} else {
			return null;
		};
	};

	public func chat(messages : [LLM.ChatMessage], task : ?Text) : async Text {
		var allMessages = switch (task) {
			case (null)  { messages };
			case (?task) {
				let withTaskAssist : LLM.ChatMessage = #user({
					content = Prompt.getTaskAssistPrompt(task);
				});
				let messageLength   = messages.size();
				var copyAllMessages = Array.thaw<LLM.ChatMessage>(messages);
				let lastUserMessage = messages[messageLength - 1];

				// Override last message with prompt assistant
				copyAllMessages[messageLength - 1] := withTaskAssist;

				// Insert again user message
				Array.append(Array.freeze(copyAllMessages), [lastUserMessage]);
			};
		};

		let response = await LLM.chat(#Llama3_1_8B).withMessages(allMessages).send();

		return switch (response.message.content) {
			case (?text) text;
			case (null) "";
		};
	};

	/**
	* AI yang akan menjadi pengingat berdasarkan deadline, progress sebelumnya dan blocking
	*/
	public shared ({caller}) func dailyStandUp(projectId : TypCommon.ProjectId) : async Text {
		let tasks                = await CanTask.getUserProjectTasks(caller, projectId);
		let isTasksAreComplete   = Array.find<TypTask.TaskResponse>(tasks, func t = t.status != #done) == null;
		let promptSummarizeTasks = switch(isTasksAreComplete) {
			case(true)  { Prompt.TASKS_COMPLETED };
			case(false) {
				var taskPrompt = Prompt.TASKS_REMAINED;
				label checkTasks for(task in tasks.vals()) {
					let doneTask = task.status == #done;
					if (doneTask) continue checkTasks;

					let priority   = if (task.priority) "yes" else "no";
					let taskReview = if (task.status != #done) {
						let review = switch(task.review) {
							case(null)    { "" };
							case(?review) { "|review:" # review.review };
						};
					} else "";

					let taskSummarize = "task:" # task.title # "|due:" # Int.toText(task.dueDate) # "|priority:" # priority # taskReview # ";";
					taskPrompt := taskPrompt # taskSummarize;
				};

				taskPrompt;
			};
		};

		let response = await LLM.chat(#Llama3_1_8B).withMessages([
			#user({ content = promptSummarizeTasks; })
		]).send();

		return switch (response.message.content) {
			case (?text) text;
			case (null) "";
		};
	};

	/**
	* AI menyemangati pengguna seperti game RPG (“XP bertambah +10 karena menyelesaikan task tepat waktu!”).
	*/
	public func gamifiedCoach(taskTitle : Text) : async Text {
		let response = await LLM.chat(#Llama3_1_8B).withMessages([
			#user({ content = Prompt.getGamifiedCoach(taskTitle) }),
		]).send();

		return switch (response.message.content) {
			case (?text) text;
			case (null) "";
		};
	};
	
	/**
	* Nanti setiap projek bisa di analisi apakah ada yang bakal keteteran ato waktu timelinenya tidak sesuai atau ada saran gitu.
	*/
	public shared func projectAnalysis(projectId : TypCommon.ProjectId) : async Text {
		let tasks = switch(await CanTask.getProjectTasks(projectId)) {
			case(#ok(tasks)) { tasks; };
			case(_)          { return "error: no project found" };
		};

		let timelines = switch(await CanProject.getTimelinesByIds(projectId)) {
			case(#ok(timelines)) { timelines; };
			case(_)              { return "error: no timeline found" };
		};

		var isTasksAreComplete = Array.find<TypTask.TaskResponse>(tasks, func t = t.status != #done) == null;
		if (isTasksAreComplete) return "project has been completed";

		var promptBase = Prompt.PROJECT_ANALYZER;

		// Combine with data tasks
		label checkTasks for(task in tasks.vals()) {
			let taskAssigness = Array.map<TypUser.UserResponse, Text>(task.assignees, func user = user.firstName);
			let taskSummarize = "task:" # task.title # "|due:" # Int.toText(task.dueDate) # "|user:" # Text.join(",", taskAssigness.vals()) # ";";
			promptBase := promptBase # taskSummarize;
		};

		// Combine with data timelines
		label checkTimelines for(timeline in timelines.vals()) {
			let timelineSummarize = "timeline:" # timeline.title # "|start:" # Int.toText(timeline.startDate) # "|end:" # Int.toText(timeline.endDate) # ";";
			promptBase := promptBase # timelineSummarize;
		};

		let response = await LLM.chat(#Llama3_1_8B).withMessages([
			#user({ content = promptBase }),
		]).send();

		return switch (response.message.content) {
			case (?text) text;
			case (null) "";
		};
	};
};
