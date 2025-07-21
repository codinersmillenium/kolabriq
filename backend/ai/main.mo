import LLM "mo:llm";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Debug "mo:base/Debug";

import TypCommon "../common/type";
import TypProject "../project/type";
import TypTask "../task/type";
import TypAi "type";

import UtlCommon "../common/util";
import Utl "../utils/helper";

import Prompt "prompt";

actor {
	// MARK: Project planner
	public func planProject(prompt : Text) : async ?TypAi.ResponseProjectLLM {
		// Tags should be according TypCommon.Tags
		let projectTags = ["backend", "bussines_analist", "frontend", "ui"];
		let tools = [
			LLM.tool("project_planner").withDescription("project planer, create project theme based on user prompt, you must and always create project name start with UHUY-").withParameter(
				LLM.parameter("project_name", #String).withDescription("Project name. Simple and short but represents the entire description.").isRequired()
			).withParameter(
				LLM.parameter("project_tags", #String).withEnumValues(projectTags).withDescription("A tag that represents the project's needs, inferred from the project name. It is used to categorize and suggest relevant tasks or team members. Each tag separated by |.").isRequired()
			).withParameter(
				LLM.parameter("task_title", #String).withDescription("Titles of task. Infered from project name. Simple and short. must generate 2 data. Each title separated by |.").isRequired()
			).withParameter(
				LLM.parameter("task_description", #String).withDescription("Descriptions of task. Infered from task title. must generate 2 data. Each description separated by |.").isRequired()
			).withParameter(
				LLM.parameter("task_tag", #String).withDescription("A task tag used to match and assign the appropriate user. Infered from task title. must generate 2 data. Each tag separated by |").isRequired()
			).withParameter(
				LLM.parameter("task_due_date", #String).withDescription("Format epoch times in second. must generate 2 data. Each time separated by |. Date epoch start from now dont past").isRequired()
			).withParameter(
				LLM.parameter("task_priority", #String).withEnumValues(["true", "false"]).withDescription("Priority of task based on title. must generate 2 data. Each priority separated by |").isRequired()
			).withParameter(
				LLM.parameter("timeline_title", #String).withDescription("Multiple titles of timeline. must generate 2 data. Each title separated by |.").isRequired()
			).withParameter(
				LLM.parameter("timeline_start", #String).withDescription("Multiple Start time of timelines. must generate 2 data. Each time start separated by |.").isRequired()
			).withParameter(
				LLM.parameter("timeline_end", #String).withDescription("Multiple End time of timelines. must generate 2 data. Each time end separated by |.").isRequired()
			).build(),
		];

		// let promptTest = "kamu sebagai ai projek planner, gunakan tool 'project_planner', wajib buat jumlah setiap param tasknya minimal 5 dan setiap value dipisahkan dengan char '|'";

		let response = await LLM.chat(#Llama3_1_8B).withMessages([
			// #system_({ content = Prompt.PROJECT_PLANNER }),
			// #system_({ content = promptTest }),
			#user({ content = prompt }),
		]).withTools(tools).send();

		let tool_calls = response.message.tool_calls;

		if (tool_calls.size() > 0) {
			let tool_call = tool_calls[0];
			let arguments = tool_call.function.arguments;

			// Find the account parameter
			var project_name = "";
			var project_tags = "";
			var task_title = "";
			var task_desc = "";
			var task_tag = "";
			var task_due = "";
			var task_priority = "";
			var timeline_title = "";
			var timeline_start = "";
			var timeline_end = "";

			for (arg in arguments.vals()) {
				switch (arg.name) {
					case ("project_name") { project_name := arg.value };
					case ("project_tags") { project_tags := arg.value };
					case ("task_title") { task_title := arg.value };
					case ("task_description") { task_desc := arg.value };
					case ("task_tag") { task_tag := arg.value };
					case ("task_due_date") { task_due := arg.value };
					case ("task_priority") { task_priority := arg.value };
					case ("timeline_title") { timeline_title := arg.value };
					case ("timeline_start") { timeline_start := arg.value };
					case ("timeline_end") { timeline_end := arg.value };
					case (_) {};
				};
			};

			Debug.print(project_name);
			Debug.print(project_tags);
			Debug.print(task_title);
			Debug.print(task_desc);
			Debug.print(task_tag);
			Debug.print(task_due);
			Debug.print(task_priority);
			Debug.print(timeline_title);
			Debug.print(timeline_start);
			Debug.print(timeline_end);

			let project : TypProject.ProjectResponseFromLLM = {
				name = project_name;
				tags = Iter.toArray(
					Iter.map(
						Text.split(project_tags, #char '|'),
						func(tag : Text) : TypCommon.Tags {
							UtlCommon.tagsFromString(tag);
						},
					)
				);
			};

			var tasks : [TypTask.TaskResponseFromLLM] = [];
			var split_title : [Text] = Iter.toArray(Text.split(task_title, #char '|'));
			var split_description : [Text] = Iter.toArray(Text.split(task_desc, #char '|'));
			var split_tag : [Text] = Iter.toArray(Text.split(task_tag, #char '|'));
			var split_due : [Text] = Iter.toArray(Text.split(task_due, #char '|'));
			var split_priority : [Text] = Iter.toArray(Text.split(task_priority, #char '|'));
			let total_tasks : Int = split_title.size();

			// check highest size

			for (i in Iter.range(0, total_tasks - 1)) {
				let data : TypTask.TaskResponseFromLLM = {
					title = split_title[i];
					description = split_description[i];
					taskTag = UtlCommon.tagsFromString(split_tag[i]);
					dueDate = Utl.textToNat(split_due[i]);
					priority = split_priority[i] == "yes";
				};

				tasks := Array.append<TypTask.TaskResponseFromLLM>(tasks, [data]);
			};

			// check highest size

			var timelines : [TypProject.TimelineResponseFromLLM] = [];
			var split_tl_title : [Text] = Iter.toArray(Text.split(timeline_title, #char '|'));
			var split_tl_start : [Text] = Iter.toArray(Text.split(timeline_start, #char '|'));
			var split_tl_end : [Text] = Iter.toArray(Text.split(timeline_end, #char '|'));
			let total_timelines : Int = timeline_title.size();

			for (i in Iter.range(0, total_timelines - 1)) {
				let data : TypProject.TimelineResponseFromLLM = {
					title = split_tl_title[i];
					start_date = Utl.textToNat(split_tl_start[i]);
					end_date = Utl.textToNat(split_tl_end[i]);
				};

				timelines := Array.append<TypProject.TimelineResponseFromLLM>(timelines, [data]);
			};

			let result : TypAi.ResponseProjectLLM = {
				project = project;
				timelines = timelines;
				// timelines = [];
				tasks = tasks;
			};

			return ?result;
		} else {
			return null;
		};
	};

	public func chat(messages : [LLM.ChatMessage], task : ?Text) : async Text {
		var allMessages = switch (task) {
			case (null) { messages };
			case (?task) {
				let withTaskAssist : LLM.ChatMessage = #user({
					content = task;
					// content = Prompt.getTaskAssistPrompt(task);
				});
				let messageLength = messages.size();
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
};
