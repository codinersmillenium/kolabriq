import LLM "mo:llm";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Buffer "mo:base/Buffer";
import Nat "mo:base/Nat";
import Rand "mo:random/Rand";

import TypCommon "../common/type";
import TypProject "../project/type";
import TypTask "../task/type";
import TypUser "../user/type";
import _TypAi "type";

import UtlCommon "../common/util";
import UtlDate "../utils/date";
import UtlAi "util";

import CanTask "canister:task";
import CanProject "canister:project";

import Prompt "prompt";

persistent actor {
	/**
	* MARK: Project planner
	* 
	* Some parameter fill with dummy data, for effecienty resource run llm
	*/ 
	public shared ({ caller }) func planProject(projectTheme : Text, thumbnail : Blob) : async ?TypCommon.ProjectId {
		// Tags should be according TypCommon.Tags
		let projectTags = ["backend", "bussines_analist", "frontend", "ui"];
		let tools = [
			LLM.tool("project_planner")
				.withDescription(Prompt.getPlannerPrompt(projectTheme))
				.withParameter(
					LLM.parameter("project:name", #String)
						.withDescription("Short project name that captures the idea.")
						.isRequired()
				)
				.withParameter(
					LLM.parameter("project:tags", #String)
						.withEnumValues(projectTags)
						.withDescription("Multiple related tag to describe project focus, separated by '|'")
						.isRequired()
				)
				.withParameter(
					LLM.parameter("task:title", #String)
						.withEnumValues(projectTags)
						.withDescription("Multiple task titles, separated by '|', simple and related to project.")
						.isRequired()
				)
				.withParameter(
					LLM.parameter("task:tag", #String)
						.withEnumValues(projectTags)
						.withDescription("Multiple task tag for assigning users, separated by '|', based on title.")
						.isRequired()
				)
				.withParameter(
					LLM.parameter("timeline:title", #String)
						.withDescription("Multiple timeline phase title, separated by '|'.")
						.isRequired()
				)
				.build(),
		];

		let response = await LLM.chat(#Llama3_1_8B).withMessages([
			#user({ content = projectTheme }),
		]).withTools(tools).send();

		Debug.print("Success");

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

			Debug.print("done");

			let dataProjectTags = if (not UtlAi.containSeparated(projectTags)) {
				[UtlCommon.tagsFromString(projectTags)]
			} else {
				let splitProjectTags = Text.split(projectTags, #char '|');
				Array.map<Text, TypCommon.Tags>(Iter.toArray(splitProjectTags), func (t) = UtlCommon.tagsFromString(t))
			};

			let project : TypProject.Project = {
				id          = 0;
            	ownerId     = caller;
				name 		= projectName;
            	desc        = projectName;
				tags 		= dataProjectTags;
				status      = #new;
				projectType = #free;
				reward      = 0;
				isCompleted = false;
				thumbnail   = thumbnail;
				createdAt   = UtlDate.now();
				createdById = caller;
				updatedAt   = null;
				updatedById = null;
			};

			let bufTimeline = Buffer.Buffer<TypProject.Timeline>(0);
			if (not UtlAi.containSeparated(timelineTitle)) {
				bufTimeline.add({
					id        = 1;
					title     = timelineTitle;
					startDate = UtlDate.addDate(await Rand.Rand().randRange(1, 3));
					endDate   = UtlDate.addDate(await Rand.Rand().randRange(4, 6));
				})
			} else {
				let splitTimelineTitle = Iter.toArray(Text.split(timelineTitle, #char '|'));
				let splitSize = splitTimelineTitle.size();
				for (i in Iter.range(0, splitSize - 1)) {
					let title = splitTimelineTitle[i];

					let startOffset = await Rand.Rand().randRange(1 + i, 3 + i);
					let endOffset = await Rand.Rand().randRange(4 + i, 6 + i);

					let startDate = UtlDate.addDate(startOffset);
					let endDate = UtlDate.addDate(endOffset);

					bufTimeline.add({
						id = i;
						title = title;
						startDate = startDate;
						endDate = endDate;
					});
				};
			};

			let projectId = await CanProject.saveLlmProjectTimelines(project, Buffer.toArray(bufTimeline));

			let splitTaskTitle = Iter.toArray(Text.split(taskTitle, #char '|'));
			let splitTaskTag = Iter.toArray(Text.split(taskTag, #char '|'));
			let rand : Int = await Rand.Rand().randRange(2, 5);

			// Task
			let bufTask = Buffer.Buffer<TypTask.Task>(0);
			if (not UtlAi.containSeparated(taskTitle)) {
				bufTask.add(UtlAi.createTask(projectId, taskTitle, #ui, rand, caller))
			} else {
				let splitSize = splitTaskTitle.size();
				for (i in Iter.range(0, splitSize - 1)) {
					bufTask.add(UtlAi.createTask(projectId, splitTaskTitle[i], #ui, rand, caller));
				};
			};
			
			// Task tag
			let bufTaskTags = Buffer.Buffer<TypCommon.Tags>(0);
			if (not UtlAi.containSeparated(taskTag)) {
				bufTaskTags.add(UtlCommon.tagsFromString(taskTag));
			} else {
				let splitSize = splitTaskTag.size();
				for (i in Iter.range(0, splitSize - 1)) {
					bufTaskTags.add(UtlCommon.tagsFromString(taskTag));
				};
			};
			
			let minRange = Nat.min(splitTaskTitle.size(), splitTaskTag.size());

			let bufTaskFinal = Buffer.Buffer<TypTask.Task>(0);
			for(i in Iter.range(0, minRange - 1)) {
				let task = bufTask.get(i);
				let tags = bufTaskTags.get(i);
				bufTaskFinal.add(UtlAi.createTask(projectId, task.title, tags, rand, caller));
			};

			await CanTask.saveLlmTasks(Buffer.toArray(bufTaskFinal));

			return ?projectId;
		} else {
			return null;
		};
	};

	/**
	* MARK: Chat
	* 
	* Some parameter fill with dummy data, for effecienty resource run llm
	*/ 
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
	* MARK: Daily stand up
	*
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
	* MARK: Gamified coach
	*
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
	* MARK: Project analyzer
	*
	* Nanti setiap projek bisa di analisi apakah ada yang bakal keteteran ato waktu timelinenya tidak sesuai atau ada saran gitu.
	*/
	public shared func projectAnalysis(projectId : TypCommon.ProjectId) : async Text {
		let tasks = switch(await CanTask.getProjectTasks(projectId)) {
			case(#ok(tasks)) { tasks; };
			case(_)          { return "error: no project found" };
		};

		let timelines = switch(await CanProject.getProjectTimelines(projectId)) {
			case(#ok(timelines)) { timelines; };
			case(_)              { return "error: no timeline found" };
		};

		var isTasksAreComplete = Array.find<TypTask.TaskResponse>(tasks, func t = t.status != #done) == null;
		if (isTasksAreComplete) return "project has been completed";

		// For testing purpose
		// let (tasks, timelines) = UtlAi.dummyProject();

		var promptBase = Prompt.PROJECT_ANALYZER;

		// Combine with data tasks
		label checkTasks for(task in tasks.vals()) {
			let taskAssigness = Array.map<TypUser.UserResponse, Text>(task.assignees, func user = user.firstName);
			let assigness = if (taskAssigness.size() > 0) "|user:" # Text.join(",", taskAssigness.vals()) else "";
			let taskSummarize = "task:" # task.title # "|due:" # Int.toText(task.dueDate) # assigness # ";";
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
