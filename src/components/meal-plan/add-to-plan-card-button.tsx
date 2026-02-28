'use client'

import { useState } from 'react'
import { useMealPlan } from '@/contexts/meal-plan-context'
import { getRecipeById } from '@/actions/get-recipe'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { ShoppingCartIcon as ShoppingCartSolidIcon } from '@heroicons/react/24/solid'

type AddToPlanCardButtonProps = {
  recipeId: string
}

export function AddToPlanCardButton({ recipeId }: AddToPlanCardButtonProps) {
  const { addRecipe, removeRecipe, isInPlan } = useMealPlan()
  const inPlan = isInPlan(recipeId)
  const [pending, setPending] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (pending) return
    if (inPlan) {
      removeRecipe(recipeId)
    } else {
      setPending(true)
      try {
        const recipe = await getRecipeById(recipeId)
        if (recipe) addRecipe(recipe)
      } catch {
        // Silently fail — recipe just won't be added
      } finally {
        setPending(false)
      }
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`absolute left-4 top-4 z-30 rounded-full bg-trinidad-500 p-2 text-white opacity-0 transition-all hover:bg-trinidad-600 group-hover:opacity-100 ${pending ? 'opacity-50 pointer-events-none' : ''}`}
      title={inPlan ? 'Remove from meal plan' : 'Add to meal plan'}
    >
      {inPlan ? (
        <ShoppingCartSolidIcon className="h-5 w-5" />
      ) : (
        <ShoppingCartIcon className="h-5 w-5" />
      )}
    </button>
  )
}
