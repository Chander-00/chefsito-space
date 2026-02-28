'use client'

import { useMealPlan } from '@/contexts/meal-plan-context'
import { Recipe } from '@/types/recipes'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { ShoppingCartIcon as ShoppingCartSolidIcon } from '@heroicons/react/24/solid'

type AddToPlanButtonProps = {
  recipe: Recipe
}

export function AddToPlanButton({ recipe }: AddToPlanButtonProps) {
  const { addRecipe, removeRecipe, isInPlan } = useMealPlan()
  const inPlan = isInPlan(recipe.recipe_id)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inPlan) {
      removeRecipe(recipe.recipe_id)
    } else {
      addRecipe(recipe)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
        inPlan
          ? 'bg-trinidad-600 text-white hover:bg-trinidad-700'
          : 'bg-trinidad-500 text-white hover:bg-trinidad-600'
      }`}
    >
      {inPlan ? (
        <>
          <ShoppingCartSolidIcon className="h-5 w-5" />
          Remove from Meal Plan
        </>
      ) : (
        <>
          <ShoppingCartIcon className="h-5 w-5" />
          Add to Meal Plan
        </>
      )}
    </button>
  )
}
