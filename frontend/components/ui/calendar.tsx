'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn(
                'bg-black rounded-lg p-1.5',
                className,
            )}
            classNames={{
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 relative',
                month: 'space-y-1.5',
                caption:
                    'flex bg-gray-400 dark:bg-white/10 justify-center rounded-lg py-2.5 relative items-center',
                caption_label:
                    'text-sm/tight font-semibold text-black dark:text-white',
                month_caption:
                    'flex bg-gray-400 dark:bg-white/10 justify-center rounded-lg py-2.5 relative items-center',
                nav: 'flex items-center justify-between absolute top-0 left-0 right-0 px-2 sm:px-3 w-full top-2 z-[1]',
                nav_button_previous: 'absolute left-3',
                nav_button_next: 'absolute right-3',
                button_previous: cn(
                    buttonVariants({ variant: 'outline-general' }),
                    'size-[22px] bg-transparent p-0 rounded-full text-black dark:text-white hover:opacity-70 hover:bg-white bg-white shadow-none ring-0',
                ),
                button_next: cn(
                    buttonVariants({ variant: 'outline-general' }),
                    'size-[22px] bg-transparent p-0 rounded-full text-black dark:text-white hover:opacity-70 hover:bg-white bg-white shadow-none ring-0',
                ),
                chevron:
                    'h-3.5 w-3.5 text-black',
                table: 'w-full border-collapse space-y-1',
                month_grid: 'w-full border-collapse space-y-1',
                weekdays: 'flex gap-3 px-3',
                weekday:
                    'rounded-md w-7 py-1.5 px-px text-center font-semibold text-xs/tight',
                week: 'flex w-full mt-1.5 gap-3 px-3',
                head_row: 'flex gap-3 px-3',
                head_cell:
                    'rounded-md w-7 py-1.5 px-px text-center font-semibold text-xs/tight',
                day: 'text-center rounded-lg text-sm p-px relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day_button: cn(
                    buttonVariants({ variant: 'outline-general' }),
                    'h-[26px] w-[26px] p-0 font-medium ring-0 shadow-none aria-selected:opacity-100',
                ),
                day_range_end: 'day-range-end',
                selected:
                    'aria-selected:*:bg-black! aria-selected:*:text-white dark:aria-selected:*:bg-white! dark:aria-selected:*:text-black',
                day_today: 'bg-accent text-accent-foreground',
                outside:
                    'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30 pointer-events-none ravi',
                day_disabled: 'text-muted-foreground opacity-50',
                day_range_middle:
                    'aria-selected:bg-accent aria-selected:text-accent-foreground',
                day_hidden: 'invisible',
                ...classNames,
            }}
            components={
                {
                    IconLeft: ({ ...props }) => (
                        <ChevronLeft className="h-4 w-4 text-black! dark:text-white!" />
                    ),
                    IconRight: ({ ...props }) => (
                        <ChevronRight className="h-4 w-4 text-black! dark:text-white!" />
                    ),
                } as any
            }
            {...props}
        />
    )
}
Calendar.displayName = 'Calendar'

export { Calendar }
