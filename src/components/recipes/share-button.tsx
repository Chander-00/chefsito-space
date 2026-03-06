"use client";

import { useState } from "react";
import { LinkIcon, CheckIcon } from "@heroicons/react/24/outline";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded border border-gray-500 px-3 py-1 text-sm text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
    >
      {copied ? (
        <>
          <CheckIcon className="h-4 w-4 text-green-400" />
          Copied!
        </>
      ) : (
        <>
          <LinkIcon className="h-4 w-4" />
          Share
        </>
      )}
    </button>
  );
}
