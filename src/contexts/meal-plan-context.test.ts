import { describe, it, expect } from 'vitest'
import { mealPlanReducer, MealPlanState } from './meal-plan-context'
import { Recipe } from '@/types/recipes'

const mockRecipe: Recipe = {
  recipe_id: 'test-1',
  recipe_name: 'Test Recipe',
  recipe_slug: 'test-recipe',
  recipe_instructions: [{ instruction: 'Step 1', step_number: 1 }],
  recipe_user_id: 'user-1',
  recipe_country: 'USA',
  recipe_description: 'A test recipe',
  recipe_image: 'https://example.com/image.jpg',
  recipe_ingredients: [
    { name: 'Flour', unit: 'g', weight: 8, quantity: 500 },
    { name: 'Sugar', unit: 'g', weight: 5, quantity: 100 },
  ],
  creator_name: 'Test Chef',
}

const mockRecipe2: Recipe = {
  recipe_id: 'test-2',
  recipe_name: 'Test Recipe 2',
  recipe_slug: 'test-recipe-2',
  recipe_instructions: [{ instruction: 'Step 1', step_number: 1 }],
  recipe_user_id: 'user-1',
  recipe_country: 'Mexico',
  recipe_description: 'Another test recipe',
  recipe_image: 'https://example.com/image2.jpg',
  recipe_ingredients: [
    { name: 'Flour', unit: 'g', weight: 9, quantity: 250 },
    { name: 'Eggs', unit: 'pz', weight: 10, quantity: 3 },
  ],
  creator_name: 'Test Chef',
}

describe('mealPlanReducer', () => {
  const emptyState: MealPlanState = { recipes: [] }

  it('adds a recipe', () => {
    const result = mealPlanReducer(emptyState, { type: 'ADD_RECIPE', recipe: mockRecipe })
    expect(result.recipes).toHaveLength(1)
    expect(result.recipes[0].recipe_id).toBe('test-1')
  })

  it('does not add duplicate recipes', () => {
    const stateWithOne = mealPlanReducer(emptyState, { type: 'ADD_RECIPE', recipe: mockRecipe })
    const result = mealPlanReducer(stateWithOne, { type: 'ADD_RECIPE', recipe: mockRecipe })
    expect(result.recipes).toHaveLength(1)
  })

  it('removes a recipe by id', () => {
    const stateWithOne = mealPlanReducer(emptyState, { type: 'ADD_RECIPE', recipe: mockRecipe })
    const result = mealPlanReducer(stateWithOne, { type: 'REMOVE_RECIPE', recipeId: 'test-1' })
    expect(result.recipes).toHaveLength(0)
  })

  it('clears all recipes', () => {
    let state = mealPlanReducer(emptyState, { type: 'ADD_RECIPE', recipe: mockRecipe })
    state = mealPlanReducer(state, { type: 'ADD_RECIPE', recipe: mockRecipe2 })
    const result = mealPlanReducer(state, { type: 'CLEAR_ALL' })
    expect(result.recipes).toHaveLength(0)
  })

  it('ignores remove for non-existent recipe', () => {
    const stateWithOne = mealPlanReducer(emptyState, { type: 'ADD_RECIPE', recipe: mockRecipe })
    const result = mealPlanReducer(stateWithOne, { type: 'REMOVE_RECIPE', recipeId: 'non-existent' })
    expect(result.recipes).toHaveLength(1)
  })
})
