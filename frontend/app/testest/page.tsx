'use client';

import { initActor } from '@/lib/canisters';
import { useEffect, useRef, useState } from 'react';
import { Drawer } from 'vaul';
import ReactMarkdown from "react-markdown";
import {
    BotMessageSquare,
    ChevronRight,
    SendHorizonal,
    X
} from 'lucide-react'
import Image from 'next/image';
import { task } from '@/declarations/task';
import AIProjectGenerator, { AIProjectGeneratorRef } from '@/components/ai/chatbot';
import DialogUi from '@/components/ui/dialog';
import ProjectPlanner from '@/components/ai/project-planner';
import { TriggerButton } from './test';


export default function Chatbot() {
    const [taskContext, setTaskContext] = useState<string | undefined>(undefined);
    const [taskCompleted, setTaskCompleted] = useState<string | undefined>(undefined);
    const [dailyStandUpId, setDailyStandUpId] = useState<number | undefined>(undefined);
    const [projectAnalysisId, setProjectAnalysisId] = useState<number | undefined>(undefined);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Input value:", inputValue);
        setIsDialogOpen(false); // tutup dialog setelah submit
    };

    const aiRef = useRef<AIProjectGeneratorRef>(null);

    const handleTriggerA = () => {
        aiRef.current?.triggerContext("Theme: E-commerce App");
    };

    const handleTriggerB = () => {
        aiRef.current?.triggerContext("Theme: Chatbot with AI");
    };


    return (
        <>
            <div className="space-y-6">
                <div className="flex gap-3">
                    <TriggerButton onTrigger={handleTriggerA} label="E-commerce Context" />
                </div>

                <AIProjectGenerator ref={aiRef} />
            </div>

            <ProjectPlanner/>

            <div className='mt-6'>
                <button
                    id="generate-project-trigger" 
                    data-aria-hidden="false"
                    aria-hidden="false"
                    onClick={() => setTaskContext("test")}
                    className="text-xs self-start px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >
                    Gunakan Konteks
                </button>

                <button
                    data-aria-hidden="false"
                    aria-hidden="false"
                    onClick={() => setTaskCompleted("create very amazing chatbot")}
                    className="text-xs self-start px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >
                    Complete task
                </button>

                {/* <button
                    onClick={() => projectPlanner("simple landing company")}
                    className="text-xs self-start px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >
                    Project planner
                </button> */}

                <button
                    data-aria-hidden="false"
                    aria-hidden="false"
                    onClick={() => setDailyStandUpId(1)}
                    className="text-xs self-start px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >
                    Daily stand up
                </button>

                <button
                    data-aria-hidden="false"
                    aria-hidden="false"
                    onClick={() => setProjectAnalysisId(1)}
                    className="text-xs self-start px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >
                    Analysis
                </button>

                {/* <ChatBot
                    taskTitle={taskContext}
                    dailyStandUpId={dailyStandUpId}
                    projectAnalysisId={projectAnalysisId}
                /> */}
            </div>
        </>
    );
}