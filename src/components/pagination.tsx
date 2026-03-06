"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = generatePageNumbers(currentPage, totalPages);

  return (
    <nav className="mt-8 flex items-center justify-center gap-1">
      <Link
        href={createPageUrl(currentPage - 1)}
        className={`rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white ${
          currentPage <= 1 ? "pointer-events-none opacity-30" : ""
        }`}
        aria-disabled={currentPage <= 1}
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </Link>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-500">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={createPageUrl(page as number)}
            className={`min-w-[2.5rem] rounded-lg px-3 py-2 text-center text-sm font-medium ${
              page === currentPage
                ? "bg-trinidad-500 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {page}
          </Link>
        )
      )}

      <Link
        href={createPageUrl(currentPage + 1)}
        className={`rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white ${
          currentPage >= totalPages ? "pointer-events-none opacity-30" : ""
        }`}
        aria-disabled={currentPage >= totalPages}
      >
        <ChevronRightIcon className="h-5 w-5" />
      </Link>
    </nav>
  );
}

function generatePageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 3) return [1, 2, 3, 4, "...", total];
  if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}
