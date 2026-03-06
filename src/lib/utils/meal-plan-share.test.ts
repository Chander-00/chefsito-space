import { describe, it, expect } from 'vitest'
import { generateShareText } from './meal-plan-share'
import { Recipe } from '@/types/recipes'
import { AggregatedIngredient } from './ingredient-aggregator'

const mockRecipes: Recipe[] = [
  {
    recipe_id: '1',
    recipe_name: 'Pasta',
    recipe_slug: 'pasta',
    recipe_instructions: [],
    recipe_user_id: 'u1',
    recipe_country: 'Italy',
    recipe_description: 'Desc',
    recipe_image: 'img',
    recipe_ingredients: [],
    creator_name: 'Chef',
  },
  {
    recipe_id: '2',
    recipe_name: 'Salad',
    recipe_slug: 'salad',
    recipe_instructions: [],
    recipe_user_id: 'u1',
    recipe_country: 'USA',
    recipe_description: 'Desc',
    recipe_image: 'img',
    recipe_ingredients: [],
    creator_name: 'Chef',
  },
]

const mockShoppingList: AggregatedIngredient[] = [
  { name: 'Flour', quantity: 1.5, unit: 'kg' },
  { name: 'Eggs', quantity: 4, unit: 'pz' },
]

describe('generateShareText', () => {
  it('generates formatted text with recipes and shopping list', () => {
    const text = generateShareText(mockRecipes, mockShoppingList, 'https://chefsito.app')
    expect(text).toContain('My Meal Plan (2 recipes)')
    expect(text).toContain('Pasta')
    expect(text).toContain('https://chefsito.app/recipes/details/pasta')
    expect(text).toContain('Salad')
    expect(text).toContain('https://chefsito.app/recipes/details/salad')
    expect(text).toContain('Flour — 1.5kg')
    expect(text).toContain('Eggs — 4pz')
  })

  it('handles single recipe', () => {
    const text = generateShareText([mockRecipes[0]], mockShoppingList, 'https://chefsito.app')
    expect(text).toContain('My Meal Plan (1 recipe)')
  })
})
