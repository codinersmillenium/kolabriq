import Principal "mo:base/Principal";
import Text "mo:base/Text";

import TypCommon "../common/type";
import TypProject "../project/type";
import TypTask "../task/type";
import TypUser "../user/type";

import UtlDate "../utils/date";

module {
    public func dummyProject() : ([TypTask.TaskResponse], [TypProject.Timeline]) {
        let principal1 = Principal.fromText("aaaaa-aa");
        // let principal2 = Principal.fromText("w7x7r-cok77-xa");
        // let principal3 = Principal.fromText("qaa6y-5yaaa-aaaaa-aaafa-cai");
        // let principal4 = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
        // let principal5 = Principal.fromText("2chl6-4hpzw-vqaaa-aaaaa-c");

        let users1: [TypUser.UserResponse] = [
            {
                id = principal1;
                userName = "johndoe";
                firstName = "John";
                lastName = "Doe";
                role = #maintainer;
                tags = [#frontend];
                referrerCode = ?"REF123";
                personalRefCode = ?"MYREF001";
                plan_type = #basic;
                plan_expired_at = null;
                createdAt = 1000000;
            },
            {
                id = principal1;
                userName = "bambang";
                firstName = "bams";
                lastName = "Doe";
                role = #maintainer;
                tags = [#frontend];
                referrerCode = ?"REF123";
                personalRefCode = ?"MYREF001";
                plan_type = #basic;
                plan_expired_at = null;
                createdAt = 1000000;
            },
        ];
        let users2: [TypUser.UserResponse] = [
            {
                id = principal1;
                userName = "konco";
                firstName = "koncok";
                lastName = "Doe";
                role = #maintainer;
                tags = [#frontend];
                referrerCode = ?"REF123";
                personalRefCode = ?"MYREF001";
                plan_type = #basic;
                plan_expired_at = null;
                createdAt = 1000000;
            },
            {
                id = principal1;
                userName = "bambang";
                firstName = "bams";
                lastName = "Doe";
                role = #maintainer;
                tags = [#frontend];
                referrerCode = ?"REF123";
                personalRefCode = ?"MYREF001";
                plan_type = #basic;
                plan_expired_at = null;
                createdAt = 1000000;
            },
        ];

        let tasks: [TypTask.TaskResponse] = [
            {
                id = 1;
                projectId = 1;
                title = "Setup Git Repository";
                description = "Inisialisasi repo dengan README dan gitignore.";
                taskTag = #backend;
                status = #in_progress;
                dueDate = 1753321941;
                priority = true;
                isOverdue = false;
                assignees = users1;
                doneAt = null;
                review = null;
            },
            {
                id = 2;
                projectId = 1;
                title = "Desain UI awal";
                description = "Buat wireframe dan design awal halaman utama.";
                taskTag = #frontend;
                status = #in_progress;
                dueDate = 1753235541;
                priority = true;
                isOverdue = false;
                assignees = users2;
                doneAt = null;
                review = null;
            }
        ];
        let timelines: [TypProject.Timeline] = [
            {
                id = 1;
                title = "Setup Git Repository";
                startDate = 1753321941;
                endDate = 1753336341;
            },
            {
                id = 1;
                title = "Build project";
                startDate = 1753235541;
                endDate = 1753681941;
            },
            {
                id = 1;
                title = "Testing";
                startDate = 1753681941;
                endDate = 1753941141;
            },
        ];


        return (tasks, timelines);
    };

    public func containSeparated(text: Text) : Bool {
        return Text.contains(text, #char '|');
    };

    public func createTask(
        projectId: TypCommon.ProjectId, 
        title: Text, 
        tags: TypCommon.Tags,
        randInt: Int, 
        caller: TypCommon.UserId,
    ) : TypTask.Task {
        return {
            id          = 0;
            projectId   = projectId;
            title       = title;
            description = title; // dummy purpose
            taskTag     = tags;
            status      = #todo;
            dueDate     = UtlDate.addDate(randInt); // dummy purpose
            priority    = randInt % 2 == 0; // dummy purpose
            assignees   = [];
            doneAt      = null;
            doneById    = null;
            createdAt   = UtlDate.now();
            createdById = caller;
            updatedAt   = null;
            updatedById = null;
        };
    };
}