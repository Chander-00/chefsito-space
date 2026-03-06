'use client'

import { useMealPlan } from '@/contexts/meal-plan-context'
import { generateShareText, shareViaWhatsApp, copyToClipboard } from '@/lib/utils/meal-plan-share'
import { TrashIcon, ShareIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function MealPlanPage() {
  const { recipes, shoppingList, removeRecipe, clearAll } = useMealPlan()
  const [copied, setCopied] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const handleShare = () => {
    const text = generateShareText(recipes, shoppingList, baseUrl)
    shareViaWhatsApp(text)
  }

  const handleCopy = async () => {
    const text = generateShareText(recipes, shoppingList, baseUrl)
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">
          My Meal Plan
          {recipes.length > 0 && (
            <span className="ml-2 text-lg text-gray-400">
              ({recipes.length} recipe{recipes.length !== 1 ? 's' : ''})
            </span>
          )}
        </h1>
        {recipes.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-2 rounded-lg border border-red-500 px-4 py-2 text-red-400 hover:bg-red-500/10"
          >
            <TrashIcon className="h-5 w-5" />
            Clear All
          </button>
        )}
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-400 mb-4">
            Your meal plan is empty
          </p>
          <Link
            href="/"
            className="rounded-lg bg-trinidad-500 px-6 py-3 text-white hover:bg-trinidad-600"
          >
            Browse Recipes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: Selected Recipes */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-white">Recipes</h2>
            <ul className="space-y-3">
              {recipes.map((recipe) => (
                <li
                  key={recipe.recipe_id}
                  className="flex items-center gap-4 rounded-xl bg-gray-800 p-3"
                >
                  <Link
                    href={`/recipes/details/${recipe.recipe_slug}`}
                    className="flex flex-1 items-center gap-4"
                  >
                    <Image
                      src={recipe.recipe_image}
                      alt={recipe.recipe_name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-white">
                        {recipe.recipe_name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {recipe.recipe_country}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => removeRecipe(recipe.recipe_id)}
                    className="rounded p-2 text-gray-400 hover:text-red-400"
                    title="Remove"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Shopping List */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-white">
              Shopping List
            </h2>
            <ul className="mb-6 space-y-2">
              {shoppingList.map((item, index) => (
                <li
                  key={`${item.name}-${item.unit}-${index}`}
                  className="flex items-center justify-between rounded-lg bg-gray-800 px-4 py-3"
                >
                  <span className="text-white">{item.name}</span>
                  <span className="font-medium text-trinidad-400">
                    {item.quantity} {item.unit}
                  </span>
                </li>
              ))}
            </ul>

            {/* Share buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-700"
              >
                <ShareIcon className="h-5 w-5" />
                Share via WhatsApp
              </button>
              <button
                onClick={handleCopy}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-700 py-3 font-medium text-white hover:bg-gray-600"
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-5 w-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardIcon className="h-5 w-5" />
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
