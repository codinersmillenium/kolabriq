'use client';

import Image from 'next/image';

export default function OverviewCard({ imageSrc, title, desc, user, avatar }: any) {
  return (
    <div className="dark:bg-black-dark bg-white shadow-3xl dark:shadow-sm rounded">
      {imageSrc && (
        <div className="h-[100px] overflow-hidden rounded-t">
          <Image
            alt="todo"
            src={imageSrc}
            width={259}
            height={100}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="space-y-4 p-3">
        <div className="inline-flex items-center gap-1.5 text-xs/[10px] font-medium bg-light-orange px-1.5 py-[3px] rounded-full">
          Medium
        </div>
        <div className="space-y-1.5">
          <h4 className="font-semibold text-black dark:text-white">{title}</h4>
          <p className="text-xs font-medium line-clamp-3">{desc}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-6 overflow-hidden rounded-lg">
            <Image src={avatar} alt={user} width={24} height={24} />
          </div>
          <span className="text-xs font-medium text-black dark:text-white">{user}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <p className="text-xs font-medium">January 01, 2024</p>
          <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white">
            📎 15
          </button>
          <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white">
            💬 15
          </button>
        </div>
      </div>
    </div>
  );
}