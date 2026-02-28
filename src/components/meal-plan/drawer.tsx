'use client'

import { useEffect } from 'react'
import { useMealPlan } from '@/contexts/meal-plan-context'
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'

type MealPlanDrawerProps = {
  isOpen: boolean
  onClose: () => void
}

export function MealPlanDrawer({ isOpen, onClose }: MealPlanDrawerProps) {
  const { recipes, removeRecipe } = useMealPlan()

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Meal plan"
        className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col bg-gray-900 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <h2 className="text-lg font-semibold text-white">
            Meal Plan ({recipes.length})
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Recipe list */}
        <div className="flex-1 overflow-y-auto p-4">
          {recipes.length === 0 ? (
            <p className="text-center text-gray-400">
              No recipes added yet. Browse recipes and add them to your meal plan.
            </p>
          ) : (
            <ul className="space-y-3">
              {recipes.map((recipe) => (
                <li
                  key={recipe.recipe_id}
                  className="flex items-center gap-3 rounded-lg bg-gray-800 p-2"
                >
                  <Image
                    src={recipe.recipe_image}
                    alt={recipe.recipe_name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <span className="flex-1 text-sm text-white truncate">
                    {recipe.recipe_name}
                  </span>
                  <button
                    onClick={() => removeRecipe(recipe.recipe_id)}
                    className="rounded p-1 text-gray-400 hover:text-red-400"
                    title="Remove"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {recipes.length > 0 && (
          <div className="border-t border-gray-700 p-4">
            <Link
              href="/meal-plan"
              onClick={onClose}
              className="block w-full rounded-lg bg-trinidad-500 py-2 text-center font-medium text-white hover:bg-trinidad-600"
            >
              View Full Shopping List
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
