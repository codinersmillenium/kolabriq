import React, { useState } from "react";
import DialogUi from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Sparkles,
    WandSparkles,
} from 'lucide-react'
import { initActor } from "@/lib/canisters";

const ProjectPlanner: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        setInputValue('');
        setIsLoading(true);

        try {
            const actor_    = await initActor("ai");
            const projectId = await actor_.planProject(inputValue);

            window.location.href = "linkprojekdetail/" + projectId;
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }

        setOpen(false);
    };

    return (
        <>
            <button 
                className="flex items-center justify-center gap-3 px-6 h-10 bg-linear-to-r from-warning/40 to-success-light/60 rounded-lg text-sm hover:bg-blue-600 transition text-gray-700 font-bold"
                onClick={() => setOpen(true)}
            >
                Generate With Briqi
                <WandSparkles size={18}/>
            </button>

            <DialogUi
                open={open}
                onOpenChange={setOpen}
                title="Generate a New Project with AI 🤖"
                content={
                    <>
                        <div className="text-[13px] mb-4">
                            Just enter your project theme — AI will generate everything from tasks to timelines, tailored for you.
                        </div>
                        <form onSubmit={handleSubmit} >
                            <input
                                type="text"
                                placeholder="Design layout company profile.."
                                className="mb-4 px-3 h-10 rounded-lg text-[13px] border border-gray-300 focus:outline-none w-full"
                                value={inputValue} 
                                onChange={(e) => setInputValue(e.target.value)}
                                required
                            />
                            <Button
                                variant={"black"}
                                type="submit"
                                className="!flex items-center justify-center gap-3 h-10 px-6 float-right"
                            >
                                Generate
                                <Sparkles/>
                            </Button>
                        </form>

                    </>
                }
            />
        </>
    );
};

export default ProjectPlanner;
