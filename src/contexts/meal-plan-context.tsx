'use client'

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  ReactNode,
} from 'react'
import { Recipe } from '@/types/recipes'
import {
  aggregateIngredients,
  AggregatedIngredient,
} from '@/lib/utils/ingredient-aggregator'

export type MealPlanState = {
  recipes: Recipe[]
}

type MealPlanAction =
  | { type: 'ADD_RECIPE'; recipe: Recipe }
  | { type: 'REMOVE_RECIPE'; recipeId: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'LOAD'; recipes: Recipe[] }

export function mealPlanReducer(
  state: MealPlanState,
  action: MealPlanAction
): MealPlanState {
  switch (action.type) {
    case 'ADD_RECIPE': {
      if (state.recipes.some((r) => r.recipe_id === action.recipe.recipe_id)) {
        return state
      }
      return { recipes: [...state.recipes, action.recipe] }
    }
    case 'REMOVE_RECIPE':
      return {
        recipes: state.recipes.filter((r) => r.recipe_id !== action.recipeId),
      }
    case 'CLEAR_ALL':
      return { recipes: [] }
    case 'LOAD':
      return { recipes: action.recipes }
    default:
      return state
  }
}

type MealPlanContextValue = {
  recipes: Recipe[]
  shoppingList: AggregatedIngredient[]
  addRecipe: (recipe: Recipe) => void
  removeRecipe: (recipeId: string) => void
  clearAll: () => void
  isInPlan: (recipeId: string) => boolean
}

const MealPlanContext = createContext<MealPlanContextValue | null>(null)

const STORAGE_KEY = 'chefsito-meal-plan'

export function MealPlanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mealPlanReducer, { recipes: [] })
  const hasLoaded = useRef(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const recipes = JSON.parse(stored) as Recipe[]
        dispatch({ type: 'LOAD', recipes })
      }
    } catch {
      // Ignore invalid stored data
    }
    hasLoaded.current = true
  }, [])

  // Sync to localStorage on change
  useEffect(() => {
    if (!hasLoaded.current) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.recipes))
  }, [state.recipes])

  const shoppingList = useMemo(() => {
    const allIngredients = state.recipes.flatMap((r) => r.recipe_ingredients)
    return aggregateIngredients(allIngredients)
  }, [state.recipes])

  const addRecipe = useCallback(
    (recipe: Recipe) => dispatch({ type: 'ADD_RECIPE', recipe }),
    []
  )

  const removeRecipe = useCallback(
    (recipeId: string) => dispatch({ type: 'REMOVE_RECIPE', recipeId }),
    []
  )

  const clearAll = useCallback(() => dispatch({ type: 'CLEAR_ALL' }), [])

  const isInPlan = useCallback(
    (recipeId: string) => state.recipes.some((r) => r.recipe_id === recipeId),
    [state.recipes]
  )

  const value = useMemo(
    () => ({ recipes: state.recipes, shoppingList, addRecipe, removeRecipe, clearAll, isInPlan }),
    [state.recipes, shoppingList, addRecipe, removeRecipe, clearAll, isInPlan]
  )

  return (
    <MealPlanContext.Provider value={value}>{children}</MealPlanContext.Provider>
  )
}

export function useMealPlan() {
  const ctx = useContext(MealPlanContext)
  if (!ctx) throw new Error('useMealPlan must be used within MealPlanProvider')
  return ctx
}
