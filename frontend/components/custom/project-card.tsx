import Image from 'next/image';
import Link from 'next/link';

type projectCard = {
    image?: string;
    tags?: string;
    title?: string;
    desc?: string;
    status?: boolean;
}

export default function ProjectCard(item: projectCard) {
  return (
    <div className="mx-auto grid w-full max-w-[938px] gap-[13px] sm:grid-cols-2 md:grid-cols-3 mt-[10px]">
      <div className="rounded-[1vw] bg-black shadow-3xl dark:shadow-sm">
        <div className="space-y-4 p-3">
          <Link
            href="/task-detail"
            className="mt-0 block rounded-sm bg-gray-200 p-2.5 ring-1 ring-gray-300 dark:bg-black-dark dark:ring-gray-300/10"
          >
            <Image
              alt="blog-img"
              width={180}
              height={180}
              src="/images/blogcard-one.svg"
              className="mx-auto duration-300 hover:scale-105"
              style={{ color: 'transparent' }}
            />
          </Link>

          <div className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs/[10px] shrink-0 font-medium whitespace-nowrap transition text-black bg-danger-light">
            Marketing
          </div>

          <div className="space-y-1.5">
            <Link
              href="/task-detail"
              className="text-sm/tight font-semibold text-black duration-300 hover:text-primary text-white inline-flex"
            >
              The Impact of Bankruptcy
            </Link>
            <p className="line-clamp-2 text-xs/normal font-medium">
              Refund is the most popular payment gateways, which is the most convenient to use for you.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-end gap-1.5 text-xs/tight font-semibold transition hover:text-black dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-thumbs-up size-4 shrink-0"
                aria-hidden="true"
              >
                <path d="M7 10v12"></path>
                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"></path>
              </svg>
              120k
            </button>

            <button
              type="button"
              className="inline-flex items-end gap-1.5 text-xs/tight font-semibold transition hover:text-black dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-users size-4 shrink-0"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              140k
            </button>
          </div>
        </div>
      </div>
      <div className="rounded-[1vw] bg-black shadow-3xl dark:shadow-sm">
        <div className="space-y-4 p-3">
          <Link
            href="/task-detail"
            className="mt-0 block rounded-sm bg-gray-200 p-2.5 ring-1 ring-gray-300 dark:bg-black-dark dark:ring-gray-300/10"
          >
            <Image
              alt="blog-img"
              width={180}
              height={180}
              src="/images/blogcard-one.svg"
              className="mx-auto duration-300 hover:scale-105"
              style={{ color: 'transparent' }}
            />
          </Link>

          <div className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs/[10px] shrink-0 font-medium whitespace-nowrap transition text-black bg-danger-light">
            Marketing
          </div>

          <div className="space-y-1.5">
            <Link
              href="/task-detail"
              className="text-sm/tight font-semibold text-black duration-300 hover:text-primary text-white inline-flex"
            >
              The Impact of Bankruptcy
            </Link>
            <p className="line-clamp-2 text-xs/normal font-medium">
              Refund is the most popular payment gateways, which is the most convenient to use for you.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-end gap-1.5 text-xs/tight font-semibold transition hover:text-black dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-thumbs-up size-4 shrink-0"
                aria-hidden="true"
              >
                <path d="M7 10v12"></path>
                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"></path>
              </svg>
              120k
            </button>

            <button
              type="button"
              className="inline-flex items-end gap-1.5 text-xs/tight font-semibold transition hover:text-black dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-users size-4 shrink-0"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              140k
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}