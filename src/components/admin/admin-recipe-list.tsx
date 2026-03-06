'use client'

import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import Link from 'next/link'
import { softDeleteRecipeAction, restoreRecipeAction } from '@/actions/admin'
import { useTransition } from 'react'

type AdminRecipe = {
  id: string
  title: string
  slug: string
  image: string
  creator: string
  country: string
  createdAt: Date
  deletedAt: Date | null
}

export function AdminRecipeList({
  recipes,
  query,
  showDeleted,
}: {
  recipes: AdminRecipe[]
  query: string
  showDeleted: boolean
}) {
  const searchParams = useSearchParams()
  const { replace } = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('query', term)
    } else {
      params.delete('query')
    }
    replace(`${pathname}?${params.toString()}`)
  }, 300)

  const handleShowDeleted = (checked: boolean) => {
    const params = new URLSearchParams(searchParams)
    if (checked) {
      params.set('showDeleted', 'true')
    } else {
      params.delete('showDeleted')
    }
    replace(`${pathname}?${params.toString()}`)
  }

  const handleDelete = (id: string) => {
    startTransition(() => softDeleteRecipeAction(id))
  }

  const handleRestore = (id: string) => {
    startTransition(() => restoreRecipeAction(id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search recipes..."
            defaultValue={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-400 focus:border-trinidad-500 focus:outline-none focus:ring-1 focus:ring-trinidad-500"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => handleShowDeleted(e.target.checked)}
            className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-trinidad-500 focus:ring-trinidad-500"
          />
          Show deleted recipes
        </label>
      </div>

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-4 py-3 text-white">Title</th>
              <th className="px-4 py-3 text-white">Creator</th>
              <th className="px-4 py-3 text-white">Country</th>
              <th className="px-4 py-3 text-white">Created</th>
              <th className="px-4 py-3 text-white">Status</th>
              <th className="px-4 py-3 text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {recipes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No recipes found.
                </td>
              </tr>
            )}
            {recipes.map((recipe) => (
              <tr key={recipe.id} className="border-b border-gray-800 last:border-0">
                <td className="px-4 py-3">{recipe.title}</td>
                <td className="px-4 py-3">{recipe.creator}</td>
                <td className="px-4 py-3">{recipe.country}</td>
                <td className="px-4 py-3">
                  {new Date(recipe.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {recipe.deletedAt ? (
                    <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
                      Deleted
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/recipes/${recipe.id}/edit`}
                      className="text-trinidad-500 hover:text-trinidad-400 text-sm"
                    >
                      Edit
                    </Link>
                    {recipe.deletedAt ? (
                      <button
                        onClick={() => handleRestore(recipe.id)}
                        disabled={isPending}
                        className="text-green-400 hover:text-green-300 text-sm disabled:opacity-50"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDelete(recipe.id)}
                        disabled={isPending}
                        className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
