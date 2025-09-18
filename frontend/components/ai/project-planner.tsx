import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from 'lucide-react'
import { initActor } from "@/lib/canisters";
// import * as Dialog from "@radix-ui/react-dialog";
import DialogUI from '@/components/ui/dialog'

const ProjectPlanner: React.FC = () => {
    const [desc, setdesc] = useState("");
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const getThumbnail = async (): Promise<number[]> => {
        const response = await fetch("/assets/thumbnail-1.jpg");
        if (!response.ok) throw new Error("Failed to load image");

        const arrayBuffer = await response.arrayBuffer();
        return Array.from(new Uint8Array(arrayBuffer));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        setdesc('Loading..');
        setIsLoading(true);

        try {
            let query = "I want to create a project about: " + inputValue;

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
                className="flex items-center justify-center gap-1 px-3 h-8 bg-linear-to-r from-warning/40 to-success-light/60 rounded-lg text-xs hover:bg-blue-600 transition text-black font-semibold shrink-0"
                onClick={() => setOpen(true)}
            >
                <Sparkles size={16} />
                Generate With AI
            </button>

            {/* TODO: JADIIN TOOLTIP YANG BISA DICOPY */}
            <DialogUI open={open} onOpenChange={setOpen} title='Generate a New Project with Briqi AI 🤖' content={
                <div>
                    <p className="text-[13px]">
                        Just enter your project theme — AI will handle everything for you, from tasks to timelines, tailored to your project.
                    </p>
                    {/* <p className="text-[10px]">
                        e.g: "Generate a project about Mobile App Development, something like building a cross-platform app for task management."
                    </p>
                    <p className="text-[10px] font-bold">
                        Want a more detailed example?
                    </p>
                    <p className="text-[10px]">
                        e.g: "Create a Website Redesign project to improve user experience and modernize the design, aiming for a reward of 500 points, starting on September 20, 2025, and finishing by December 1, 2025."
                    </p> */}

                    <form onSubmit={handleSubmit} className="mt-4">
                        <input
                            type="text"
                            placeholder="Design layout company profile.."
                            className="mb-1 px-3 h-10 rounded-lg text-[13px] border border-gray-300 focus:outline-none w-full"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            required
                        />
                        <div className="flex items-center gap-1 mt-1">
                            <div className="loader"></div>
                            <div className="text-xs">Loading..</div>
                        </div>
                        {desc && (
                            <div className="text-xs">{desc}</div>
                        )}
                        <Button
                            variant={"black"}
                            type="submit"
                            className="mt-2 !flex items-center justify-center gap-1 h-10 px-6 float-right"
                        >
                            Generate
                            <Sparkles />
                        </Button>
                    </form>
                </div>
            } />

            {/* <Dialog.Root open={open} onOpenChange={setOpen}>
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
            </Dialog.Root> */}
        </>
    );
};

export default ProjectPlanner;
