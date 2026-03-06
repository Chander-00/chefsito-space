"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useDebouncedCallback } from "use-debounce";

const WAIT_TILL_CHANGE = 500;

export function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);

    params.set("page", "1");

    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, WAIT_TILL_CHANGE);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="
          block 
          w-full p-4 
          ps-10 text-sm 
          text-gray-900 
          border 
          border-gray-300 
          rounded-lg 
          dark:bg-trinidad-500
          dark:bg-opacity-50
          dark:border-trinidad-300
          dark:placeholder-gray-100 
          dark:text-white 
          dark:focus:ring-trinidad-500 
          dark:focus:border-trinidad-500
          "
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
          // border - o - primary;
        }}
        defaultValue={searchParams.get("query")?.toString()}
      />
      <MagnifyingGlassIcon
        className="
        absolute 
        left-3 
        top-1/2 
        h-[18px] 
        w-[18px] 
        -translate-y-1/2 
        text-trinidad-100 
        peer-focus:text-gray-900"
      />
    </div>
  );
}
