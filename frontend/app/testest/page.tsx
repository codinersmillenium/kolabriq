'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';

export default function Chatbot() {
    const [context, setContext] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const addContext = () => {
        setContext("Menanyakan cara kerja drawer dan posisi input di dalam komponen")
        setIsOpen(true);
    }

    return (
        <>
            <button
                onClick={addContext}
                className="text-xs self-start px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
                Gunakan Konteks
            </button>

            <Drawer.Root direction="right" open={isOpen} onOpenChange={setIsOpen}>
                <Drawer.Trigger className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white">
                    Open Drawer
                </Drawer.Trigger>
                <Drawer.Portal>

                    
                    <Drawer.Content
                        className="right-2 bottom-2 fixed z-20 outline-none w-[310px] h-7/12 flex shadow-lg border border-gray-300 rounded-xl"
                        style={{ '--initial-transform': 'calc(100% + 8px)' } as React.CSSProperties}
                    >
                        <div className="bg-white h-full w-full grow p-5 flex flex-col rounded-[16px]">

                            {/* Context Reference */}

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                {/* User Message */}
                                <div className="flex justify-end">
                                    <div className="bg-gray-600 text-white text-sm px-4 py-2 rounded-lg max-w-[80%]">
                                        Bagaimana cara menggunakan drawer ini?
                                    </div>
                                </div>

                                {/* System Message */}
                                <div className="flex justify-start">
                                    <div className="bg-gray-200 text-gray-900 text-sm px-4 py-2 rounded-lg max-w-[80%]">
                                        Drawer ini bisa diarahkan ke kanan, kiri, atas, atau bawah. Kamu bisa menambahkan isi apapun di dalamnya.
                                    </div>
                                </div>
                            </div>

                            {context && (
                                <div className="flex items-center justify-between text-xs text-gray-700 bg-gray-100 px-3 py-1 rounded truncate">
                                    <span className="truncate">
                                        <span className="font-medium text-gray-800">Context: </span>
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
                            <form className="mt-4 flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); /* handle send here */ }}>
                                <input
                                    type="text"
                                    placeholder="Ketik pesan..."
                                    className="flex-1 px-3 py-2 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
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