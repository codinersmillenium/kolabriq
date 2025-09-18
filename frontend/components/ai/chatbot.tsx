'use client';

import { initActor } from '@/lib/canisters';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Drawer } from 'vaul';
import ReactMarkdown from "react-markdown";
import {
    BotMessageSquare,
    ChevronRight,
    SendHorizonal,
    X,
    ChartNoAxesCombined,
    WandSparkles,
    Minimize2,
    Maximize2,
} from 'lucide-react'
import Image from 'next/image';

type LlmChat =
    | { system: { content: string }; user?: never }
    | { user: { content: string, task: string }; system?: never };

type TriggerButtonProps = {
    onTrigger: () => void;
};

// MARK: Ask task
export const AskButton = ({ onTrigger }: TriggerButtonProps) => {
    return (
        <button
            onClick={onTrigger}
            className="text-xs p-2 py-1 bg-linear-to-r from-danger/80 to-warning/50 text-white rounded flex items-center gap-1"
        >
            Ask
            <WandSparkles size={16} />
        </button>
    );
};

// MARK: Anaylis project
export const AnalysisButton = ({ onTrigger }: TriggerButtonProps) => {
    return (
        <button
            onClick={onTrigger}
            className="text-xs p-2 py-2 bg-linear-to-r from-success/80 to-primary/50 text-white rounded-lg flex items-center gap-1 font-bold"
        >
            <ChartNoAxesCombined size={18} />
            Analysis
        </button>
    );
};

export type ChatbotRef = {
    triggerContext: (task: string) => void;
    triggerAnalysis: (projectId: number) => void;
    triggerGamified: (task: string) => void;
    triggerDailyStandUp: (projectId: number) => void;
};

const Chatbot = forwardRef<ChatbotRef>((_, ref) => {
    const [taskContext, setTaskContext] = useState<string>();
    const [isOpen, setIsOpen] = useState(false);
    const [chat, setChat] = useState<LlmChat[]>([
        {
            system: {
                content: `Hi! I'm **Briqi**, your AI assistant from Kolabriq.\n\nI can:\n-Plan projects from your ideas\n-Track tasks & suggest priorities\n-Understand context when you're stuck\n-Cheer you on like an RPG coach\n-Analyze project timelines & give smart tips.\n\nJust ask me anything about your tasks — I'm here to help. 💼✨`
            }
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [unreadMessage, setUnreadMessage] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // useImperativeHandle(ref, () => ({
    //     triggerContext: (task: string) => {
    //         setTaskContext(task);
    //         addUnread();
    //     },
    //     triggerAnalysis: (projectId: number) => projectAnalysis(projectId),
    //     triggerGamified: (task: string) => gamifiedAi(task),
    //     triggerDailyStandUp: (projectId: number) => dailyStandUp(projectId),
    // }));

    // MARK: Toogle fullscreen
    const [isFullscreen, setIsFullscreen] = useState(false);
    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

    const contentStyle = () => {
        let style = "right-3 bottom-3 fixed z-20 outline-none rounded-xl overflow-hidden !transition-all duration-500 ease-in-out bg-white shadow-lg border border-gray-300"

        if (isFullscreen) {
            style += " w-[calc(100%-288px)] h-[calc(100%-88px)]"
        } else {
            style += " w-[25%] h-3/4"
        }

        return style
    }













    const addUnread = () => {
        if (!isOpen) {
            const totalUnreadMessage = unreadMessage + 1;
            setUnreadMessage(totalUnreadMessage);
        }
    }

    const addPreResponse = (message: string): LlmChat => {
        const userMessage = {
            user: {
                content: message,
                task: "",
            }
        };

        const thinkingMessage = {
            system: { content: 'Thinking...' }
        };

        setChat((prevChat) => [...prevChat, userMessage, thinkingMessage]);

        return userMessage;
    }

    const error = (prevChat: LlmChat[]): LlmChat[] => {
        const newChat = [...prevChat];
        newChat.pop(); // Remove Briqi thinking..
        newChat.push({
            system: {
                content: "Uh-oh! Looks like your resources are a bit too potato for this one 🥔\nI couldn’t process the request. Try again later, or maybe give your machine a little break 🤭",
            },
        });

        return newChat;
    }

    const askAgent = async (messages: LlmChat) => {
        try {

            // const actor_ = await initActor("ai");
            // const response = await actor_.chat([messages], [taskContext]);

            setTaskContext("");
            addUnread();

            setChat((prevChat) => {
                const newChat = [...prevChat];
                newChat.pop();
                newChat.push({ system: { content: "hii" } });
                return newChat;
            });
        } catch (e) {
            console.error(e);
            setChat(error);
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        let userMsg = addPreResponse(inputValue);
        userMsg = {
            user: {
                content: userMsg.user?.content ?? "",
                task: taskContext ?? "",
            }
        };

        setInputValue('');
        setIsLoading(true);
        askAgent(userMsg);

        setTimeout(() => {
            scrollToBottom();
        }, 100);
    };

    const gamifiedAi = async (taskCompleted: string) => {
        const message = `I have been completed task ${taskCompleted}`;
        addPreResponse(message);
        setIsLoading(true);

        try {
            const actor_ = await initActor("ai");
            const response = await actor_.gamifiedCoach(taskCompleted);
            addUnread();

            setChat((prevChat) => {
                const newChat = [...prevChat];
                newChat.pop(); // Remove Briqi thinking..
                newChat.push({ system: { content: response } });
                return newChat;
            });
        } catch (e) {
            console.error(e);
            setChat(error);
        } finally {
            setIsLoading(false);
        }
    };

    const dailyStandUp = async (projectId: number) => {
        console.log(projectId);

        const message = "Review my tasks for today";
        addPreResponse(message);
        setIsLoading(true);

        try {
            const actor_ = await initActor("ai");
            const response = await actor_.dailyStandUp(0);
            addUnread();

            setChat((prevChat) => {
                const newChat = [...prevChat];
                newChat.pop(); // Remove Briqi thinking..
                newChat.push({ system: { content: response } });
                return newChat;
            });
        } catch (e) {
            console.error(e);
            setChat(error);
        } finally {
            setIsLoading(false);
        }
    };

    const projectAnalysis = async (projectId: number) => {
        const message = "Analysis my current project";
        setIsOpen(true);
        addPreResponse(message);
        setIsLoading(true);

        try {
            const actor_ = await initActor("ai");
            const response = await actor_.projectAnalysis(0);
            addUnread();

            setChat((prevChat) => {
                const newChat = [...prevChat];
                newChat.pop(); // Remove Briqi thinking..
                newChat.push({ system: { content: response } });
                return newChat;
            });
        } catch (e) {
            console.error(e);
            setChat(error);

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Drawer.Root direction="right" modal={false} open={isOpen}>
            <Drawer.Trigger
                className="fixed bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full shadow-sm bg-linear-to-r from-primary/20 to-success/40 text-white"
                onClick={() => {
                    setUnreadMessage(0);
                    setIsOpen(true);
                }}
            >
                {unreadMessage > 0 &&
                    <div className="absolute -top-0.5 -left-1 bg-danger text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow">
                        {unreadMessage > 99 ? '99+' : unreadMessage}
                    </div>
                }
                <BotMessageSquare size={28} strokeWidth={2.5} />
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Content
                    aria-describedby={"dialog"}
                    className={contentStyle()}
                    style={{ '--initial-transform': 'calc(100% + 8px)' } as React.CSSProperties}
                >
                    <Drawer.Title className="w-full h-[150px] p-3 relative">
                        <Drawer.Close
                            className="h-6 w-6 rounded-lg bg-white absolute right-4 flex items-center justify-center z-10"
                            onClick={() => setIsOpen(false)}
                        >
                            <ChevronRight size={12} />
                        </Drawer.Close>

                        <div className="bg-white absolute top-0 left-0 -z-1 h-full w-full">
                            <Image
                                src="/images/home-bg.png"
                                fill
                                alt="home-bg"
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority
                            />
                        </div>
                        <div className="flex justify-center gap-2 mb-4 mt-1.5">
                            <button type="button" className="bg-gray-200 shadow flex items-center gap-1 px-5 h-6 text-[10px] rounded-lg">
                                Chat
                            </button>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center justify-center gap-2">
                                <div className="rounded-full w-8 h-8 bg-linear-to-b from-primary/20 to-success/40 flex items-center justify-center">
                                    <BotMessageSquare color="#fff" size={20} />
                                </div>
                                <div className="font-bold text-gray-700">
                                    Briqi from Kolabriq
                                </div>
                            </div>

                            {/* Fullscreen toggle button */}
                            <button
                                className="h-6 w-6 rounded-lg bg-white flex items-center justify-center z-10 hover:bg-gray-100 transition-colors"
                                onClick={toggleFullscreen}
                                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                            >
                                {isFullscreen
                                    ? <button type="button" className="bg-gray-200 shadow flex items-center gap-1 px-5 h-6 text-[10px] rounded-lg">
                                        <Minimize2 size={10} />
                                        Minimize
                                    </button>
                                    :
                                    <button type="button" className="bg-gray-200 shadow flex items-center gap-1 px-5 h-6 text-[10px] rounded-lg">
                                        <Maximize2 size={10} />
                                        Maximize
                                    </button>}
                            </button>
                        </div>
                    </Drawer.Title>
                    <div className="bg-white h-[calc(100%-150px)] w-full grow py-5 flex flex-col rounded-[16px]">
                        <div className="flex-1 overflow-y-auto space-y-3 px-4 pr-1 custom-scroll pb-4">
                            {chat.map((message, index) => {
                                const isUser = 'user' in message;
                                const name = isUser ? 'You' : 'Briqi';
                                const text = isUser
                                    ? message.user?.content ?? ""
                                    : message.system?.content ?? ""

                                return (
                                    <div key={index} className={`flex flex-col gap-1 px-4  ${isUser ? "items-end justify-end" : "items-start justify-start"}`}>
                                        <span className="text-xs text-gray-700 pr-2">{name}</span>
                                        {message.user?.task &&
                                            <div className="flex items-center justify-between text-xs text-gray-700 bg-gray-100 px-3 py-2 rounded-lg truncate drop-shadow-sm mb-1">
                                                <span className="truncate">
                                                    <span className="font-medium text-gray-800">Task: </span>
                                                    {message.user?.task}
                                                </span>
                                            </div>
                                        }
                                        <div className={`text-[13px] py-2 px-4 rounded-lg drop-shadow-md max-w-[80%] whitespace-pre-line ${isUser
                                            ? "bg-linear-to-b from-primary/5 to-success-light/20 text-gray"
                                            : "bg-gray-100 text-gray-700"
                                            }`}>
                                            <ReactMarkdown>{text}</ReactMarkdown>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef}></div>
                        </div>

                        {taskContext &&
                            <div className="flex items-center justify-between text-xs text-gray-700 bg-gray-100 px-3 py-2 mx-4 rounded-lg truncate border border-gray-300">
                                <span className="truncate">
                                    <span className="font-medium text-gray-800">Task: </span>
                                    {taskContext}
                                </span>
                                <button
                                    onClick={() => setTaskContext("")}
                                    className="ml-2 text-gray-500 hover:text-red-500"
                                >
                                    <X size={12} color='#6b7280' />
                                </button>
                            </div>
                        }

                        {/* Input Box */}
                        <form className="mt-2 flex items-center gap-2 mx-4" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Help me about this task briqi.."
                                className="flex-1 px-3 h-10 rounded-lg text-xs border border-gray-300 focus:outline-none"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className="px-3 h-10 bg-linear-to-b from-danger/20 to-success-light/40 rounded-lg text-sm hover:bg-blue-600 transition"
                                disabled={isLoading}
                            >
                                <SendHorizonal size={16} />
                            </button>
                        </form>

                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
})

export default Chatbot;
