"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { softDeleteRecipeAction } from "@/actions/admin";

interface InlineRecipeActionsProps {
  recipeId: string;
}

export function InlineRecipeActions({ recipeId }: InlineRecipeActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;

    startTransition(async () => {
      await softDeleteRecipeAction(recipeId);
      router.push("/");
    });
  }

  return (
    <div className="flex gap-2">
      <Link
        href={`/admin/recipes/${recipeId}/edit`}
        className="rounded border border-trinidad-500 px-3 py-1 text-sm text-trinidad-500 hover:bg-trinidad-500 hover:text-white transition-colors"
      >
        Edit
      </Link>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="rounded border border-red-500 px-3 py-1 text-sm text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
