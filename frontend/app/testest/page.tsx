'use client';

import IconGoogle from '@/components/icons/icon-google';
import { initActor } from '@/lib/canisters';
import { useEffect, useRef, useState } from 'react';
import { Drawer } from 'vaul';
import ReactMarkdown from "react-markdown";

type LlmChat =
  | { system: { content: string }; user?: never }
  | { user: { content: string }; system?: never }

export default function Chatbot() {
    const [context, setContext] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [chat, setChat] = useState<LlmChat[]>([
        {
            system: { 
                content: `Hello! I'm Briqi, your AI companion from Kolabriq.\nI can help you manage your tasks, keep track of deadlines, and give smart suggestions to stay on track.\n\nYou can say things like:\n- "What tasks are due this week?"\n- "How's my progress on the 'Onboarding Campaign' task?"\n- "Suggest how to reschedule overlapping tasks."\n\nJust ask me anything about your tasks — I'm here to help. 💼✨`
            }
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatBoxRef = useRef<HTMLDivElement | null>(null);

    const addContext = () => {
        setContext("Design landing layout")
        setIsOpen(true);
    }

    const askAgent = async (messages: LlmChat, task: string[]) => {
        setContext("");

        try {
            const actor_   = await initActor("ai");
            const response = await actor_.chat([messages], task);

            setChat((prevChat) => {
                const newChat = [...prevChat];
                newChat.pop(); // Remove Briqi thinking..
                newChat.push({ system: { content: response } });
                return newChat;
            });
        } catch (e) {
            console.error(e);
            setChat((prevChat) => {
                const newChat = [...prevChat];
                newChat.pop(); // Remove Briqi thinking..
                newChat.push({
                    system: {
                        content: "Uh-oh! Looks like your resources are a bit too potato for this one 🥔\nI couldn’t process the request. Try again later, or maybe give your machine a little break 🤭",
                    },
                });

                return newChat;
            });

        } finally {
            setIsLoading(false);
        }
    };

    const gamifiedAi = async (task: string) => {
        setContext("");

        try {
            const actor_   = await initActor("ai");
            const response = await actor_.gamifiedCoach(task);

            setChat((prevChat) => {
                const newChat = [...prevChat];
                newChat.pop(); // Remove Briqi thinking..
                newChat.push({ system: { content: response } });
                return newChat;
            });
        } catch (e) {
            console.error(e);
            setChat((prevChat) => {
                const newChat = [...prevChat];
                newChat.pop(); // Remove Briqi thinking..
                newChat.push({
                    system: {
                        content: "Uh-oh! Looks like your resources are a bit too potato for this one 🥔\nI couldn’t process the request. Try again later, or maybe give your machine a little break 🤭",
                    },
                });

                return newChat;
            });

        } finally {
            setIsLoading(false);
        }
    };

    const projectPlanner = async (task: string) => {
        setContext("");

        try {
            const actor_   = await initActor("ai");
            const response = await actor_.planProject(task);

            console.log(response);
            
        } catch (e) {
            console.error(e);
            setChat((prevChat) => {
                const newChat = [...prevChat];
                newChat.pop(); // Remove Briqi thinking..
                newChat.push({
                    system: {
                        content: "Uh-oh! Looks like your resources are a bit too potato for this one 🥔\nI couldn’t process the request. Try again later, or maybe give your machine a little break 🤭",
                    },
                });

                return newChat;
            });

        } finally {
            setIsLoading(false);
        }
    };

    const dailyStandUp = async (task: any) => {
        setContext("");

        try {
            const actor_   = await initActor("ai");
            const response = await actor_.dailyStandUp(task);

            setChat((prevChat) => {
                const newChat = [...prevChat];
                newChat.pop(); // Remove Briqi thinking..
                newChat.push({ system: { content: response } });
                return newChat;
            });
        } catch (e) {
            console.error(e);
            setChat((prevChat) => {
                const newChat = [...prevChat];
                newChat.pop(); // Remove Briqi thinking..
                newChat.push({
                    system: {
                        content: "Uh-oh! Looks like your resources are a bit too potato for this one 🥔\nI couldn’t process the request. Try again later, or maybe give your machine a little break 🤭",
                    },
                });

                return newChat;
            });

        } finally {
            setIsLoading(false);
        }
    };

    const anaylis = async (task: any) => {
        setContext("");

        try {
            const actor_   = await initActor("ai");
            const response = await actor_.projectAnalysis(task);

            setChat((prevChat) => {
                const newChat = [...prevChat];
                newChat.pop(); // Remove Briqi thinking..
                newChat.push({ system: { content: response } });
                return newChat;
            });
            // TODO: PUSH THINKING
        } catch (e) {
            console.error(e);
            setChat((prevChat) => {
                const newChat = [...prevChat];
                newChat.pop(); // Remove Briqi thinking..
                newChat.push({
                    system: {
                        content: "Uh-oh! Looks like your resources are a bit too potato for this one 🥔\nI couldn’t process the request. Try again later, or maybe give your machine a little break 🤭",
                    },
                });

                return newChat;
            });

        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = {
            user: { content: inputValue }
        };

        const thinkingMessage = {
            system: { content: 'Thinking...' }
        };

        setChat((prevChat) => [...prevChat, userMessage, thinkingMessage]);
        setInputValue('');
        setIsLoading(true);

        askAgent(userMessage, context ? [context] : []);
    };

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [chat]);

    return (
        <>
            <button
                onClick={addContext}
                className="text-xs self-start px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
                Gunakan Konteks
            </button>

            <button
                onClick={() => gamifiedAi("create very amazing chatbot")}
                className="text-xs self-start px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
                Complete task
            </button>

            <button
                onClick={() => projectPlanner("simple landing company")}
                className="text-xs self-start px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
                Project planner
            </button>

            <button
                onClick={() => dailyStandUp(1)}
                className="text-xs self-start px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
                Daily stand up
            </button>

            <button
                onClick={() => anaylis(1)}
                className="text-xs self-start px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
                Analysis
            </button>

            <Drawer.Root direction="right" open={isOpen} onOpenChange={setIsOpen}>
                <Drawer.Trigger className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white">
                    Open Drawer
                </Drawer.Trigger>
                <Drawer.Portal>
                    <Drawer.Content
                        className="right-2 bottom-2 fixed z-20 outline-none w-[440px] h-3/4 shadow-lg border border-gray-300 rounded-xl overflow-hidden"
                        style={{ '--initial-transform': 'calc(100% + 8px)' } as React.CSSProperties}
                    >
                        <Drawer.Title className="w-full h-1/6 bg-gray p-3 relative">
                            <Drawer.Close className="h-6 w-6 rounded-md bg-white absolute right-4 flex items-center justify-center">
                                <IconGoogle/>
                            </Drawer.Close>
                            <div className="flex justify-center gap-2 mb-5 mt-1.5">
                                <button className="bg-white flex items-center gap-1 px-5 h-5 text-[10px] rounded-lg">
                                    <IconGoogle className="w-3.5"/>
                                    Chat
                                </button>
                                <button className="bg-white flex items-center gap-1 px-5 h-5 text-[10px] rounded-lg">
                                    <IconGoogle className="w-3.5"/>
                                    Get Insight
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <div className="rounded-full w-8 h-8 bg-white"></div>
                                <div className="font-bold text-white">Briqi from Kolabriq</div>
                            </div>
                        </Drawer.Title>
                        <div className="bg-white h-5/6 w-full grow p-5 flex flex-col rounded-[16px]">
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scroll mb-4">
                                {chat.map(message => {
                                    const isUser = 'user' in message;
                                    const name = isUser ? 'You' : 'Briqi';
                                    const text = isUser
                                        ? message.user?.content ?? ""
                                        : message.system?.content ?? ""

                                    return (
                                        <div className={`flex flex-col gap-1 ${ isUser ? "items-end justify-end" : "items-start justify-start" }`}>
                                            <span className="text-xs text-gray-500 pr-2">{name}</span>
                                            <div className={`text-[13px] px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-line ${
                                                isUser
                                                    ? "bg-gray-600 text-white"
                                                    : "bg-gray-200 text-gray-600"
                                            }`}>
                                                <ReactMarkdown>{text}</ReactMarkdown>;
                                            </div>
                                        </div>
                                    );

                                })}
                            </div>

                            {context && (
                                <div className="flex items-center justify-between text-xs text-gray-700 bg-gray-100 px-3 py-1 rounded truncate">
                                    <span className="truncate">
                                        <span className="font-medium text-gray-800">Task: </span>
                                        {context}
                                    </span>
                                    <button
                                        onClick={() => setContext(null)}
                                        className="ml-2 text-gray-500 hover:text-red-500"
                                    >
                                        X
                                    </button>
                                </div>
                            )}

                            {/* Input Box */}
                            <form className="mt-2 flex items-center gap-2" onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    placeholder="Ketik pesan..."
                                    className="flex-1 px-3 py-2 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={inputValue} 
                                    onChange={(e) => setInputValue(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                                    disabled={isLoading}
                                >
                                    Kirim
                                </button>
                            </form>

                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </>
    );
}