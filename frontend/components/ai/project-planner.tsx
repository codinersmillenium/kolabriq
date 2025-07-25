import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from 'lucide-react'
import { initActor } from "@/lib/canisters";
import * as Dialog from "@radix-ui/react-dialog";

const ProjectPlanner: React.FC = () => {
    const [desc, setdesc] = useState("");
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        setdesc('Loading..');
        setIsLoading(true);

        try {
            const actor_    = await initActor("ai");
            const projectId = await actor_.planProject(inputValue);

            if (!projectId) {
                setdesc('Try again with another simple idea');
            }
        } catch (e) {
            console.error(e);
            setdesc('Try again with another simple idea');
        } finally {
            setIsLoading(false);
        }

        window.location.reload();
    };

    return (
        <>
            <button 
                className="flex items-center justify-center gap-1 px-3 h-8 bg-linear-to-r from-warning/40 to-success-light/60 rounded-lg text-xs hover:bg-blue-600 transition text-gray-700 font-bold shrink-0"
                onClick={() => setOpen(true)}
            >
                <Sparkles size={16}/>
                Generate With Briqi
            </button>

            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="bg-black/15 fixed inset-0 z-10 w-full h-full"/>
                    <Dialog.Content className="bg-white shadow-md fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] p-6 rounded-xl !z-20">
                        <Dialog.Title className="mb-2.5 font-bold">Generate a New Project with AI 🤖</Dialog.Title>
                        <div>
                            <span className="text-[13px]">
                                Just enter your project theme — AI will generate everything from tasks to timelines, tailored for you.
                            </span>
                            <form onSubmit={handleSubmit} className="mt-4">
                                <input
                                    type="text"
                                    placeholder="Design layout company profile.."
                                    className="mb-1 px-3 h-10 rounded-lg text-[13px] border border-gray-300 focus:outline-none w-full"
                                    value={inputValue} 
                                    onChange={(e) => setInputValue(e.target.value)}
                                    required
                                />
                                {desc && (
                                    <div className="text-xs">{desc}</div>
                                )}
                                <Button
                                    variant={"black"}
                                    type="submit"
                                    className="mt-2 !flex items-center justify-center gap-1 h-10 px-6 float-right"
                                >
                                    Generate
                                    <Sparkles/>
                                </Button>
                            </form>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
};

export default ProjectPlanner;
