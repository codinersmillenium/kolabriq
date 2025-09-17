'use client'

import { Badge } from '@/components/ui/badge'

import { ColumnDef } from '@tanstack/react-table'
import { MoveDown, MoveUp } from 'lucide-react'

export type IBlockHistory = {
    id: bigint;
    data?: any;
    hash: string;
    signature: string;
    timestamp: bigint;
}

export const historyColumns: ColumnDef<IBlockHistory>[] = [
    {
        accessorKey: 'hash',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-1.5"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <span className="inline-flex items-center -space-x-[5px]">
                        <MoveDown
                            className={`size-2.5 shrink-0 text-black ${column.getIsSorted() === 'asc' && 'text-gray-500'}`}
                        />
                        <MoveUp
                            className={`size-2.5 shrink-0 text-gray-500 ${column.getIsSorted() === 'asc' && 'text-black!'}`}
                        />
                    </span>
                    Signature
                </button>
            )
        },
        cell: ({ row }) => <div>{row.getValue('hash')}</div>,
    },
    {
        accessorKey: 'id',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-1.5"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <span className="inline-flex items-center -space-x-[5px]">
                        <MoveDown
                            className={`size-2.5 shrink-0 text-black ${column.getIsSorted() === 'asc' && 'text-gray-500'}`}
                        />
                        <MoveUp
                            className={`size-2.5 shrink-0 text-gray-500 ${column.getIsSorted() === 'asc' && 'text-black!'}`}
                        />
                    </span>
                    Block
                </button>
            )
        },
        cell: ({ row }) => (
            <Badge className="bg-gray-400 text-black">
                {row.getValue('id')}
            </Badge>
        ),
    },
    {
        accessorKey: 'age',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-1.5"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <span className="inline-flex items-center -space-x-[5px]">
                        <MoveDown
                            className={`size-2.5 shrink-0 text-black ${column.getIsSorted() === 'asc' && 'text-gray-500'}`}
                        />
                        <MoveUp
                            className={`size-2.5 shrink-0 text-gray-500 ${column.getIsSorted() === 'asc' && 'text-black!'}`}
                        />
                    </span>
                    Age
                </button>
            )
        },
        cell: ({ row }) => {
            const now = Date.now();
            const past = Number(row.getValue('timestamp')) * 1000;

            const diffMs = now - past;
            const seconds = Math.floor(diffMs / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) return `${days} day(s) ago`;
            if (hours > 0) return `${hours} hour(s) ago`;
            if (minutes > 0) return `${minutes} minute(s) ago`;

            return `${seconds} second(s) ago`;
        },
    },
    {
        accessorKey: 'timestamp',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-1.5"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <span className="inline-flex items-center -space-x-[5px]">
                        <MoveDown
                            className={`size-2.5 shrink-0 text-black ${column.getIsSorted() === 'asc' && 'text-gray-500'}`}
                        />
                        <MoveUp
                            className={`size-2.5 shrink-0 text-gray-500 ${column.getIsSorted() === 'asc' && 'text-black!'}`}
                        />
                    </span>
                    Timestamp
                </button>
            )
        },
        cell: ({ row }) => {
            const date = new Date(Number(row.getValue('timestamp')) * 1000);

            return date.toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            }).replace(",", " at");
        },
    },
    {
        accessorKey: 'result',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-1.5"
                >
                    Result
                </button>
            )
        },
        cell: ({ row }) => (
            <Badge
                variant={"green"}
                className="capitalize"
            >
                Success
            </Badge>
        ),
    },
]
