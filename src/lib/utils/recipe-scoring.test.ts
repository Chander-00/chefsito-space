import { describe, it, expect } from 'vitest'
import { scoreRecipe, filterAndScoreRecipes } from './recipe-scoring'

describe('scoreRecipe', () => {
  it('returns 1.0 when user has all ingredients', () => {
    const recipeIngredients = [
      { name: 'Pasta', weight: 10 },
      { name: 'Tomato', weight: 5 },
      { name: 'Basil', weight: 2 },
    ]
    const userIngredients = ['pasta', 'tomato', 'basil']
    const result = scoreRecipe(recipeIngredients, userIngredients)
    expect(result).toEqual({ score: 1.0, excluded: false })
  })

  it('returns proportional score for partial match', () => {
    const recipeIngredients = [
      { name: 'Pasta', weight: 10 },
      { name: 'Tomato', weight: 5 },
      { name: 'Basil', weight: 2 },
    ]
    const userIngredients = ['pasta', 'tomato']
    const result = scoreRecipe(recipeIngredients, userIngredients)
    expect(result.score).toBeCloseTo(15 / 17)
    expect(result.excluded).toBe(false)
  })

  it('excludes recipe when missing ingredient with weight >= 9', () => {
    const recipeIngredients = [
      { name: 'Pasta', weight: 10 },
      { name: 'Tomato', weight: 5 },
      { name: 'Basil', weight: 2 },
    ]
    const userIngredients = ['tomato', 'basil']
    const result = scoreRecipe(recipeIngredients, userIngredients)
    expect(result.excluded).toBe(true)
    expect(result.score).toBe(0)
  })

  it('excludes recipe when missing ingredient with weight exactly 9', () => {
    const recipeIngredients = [
      { name: 'Rice', weight: 9 },
      { name: 'Soy Sauce', weight: 3 },
    ]
    const userIngredients = ['soy sauce']
    const result = scoreRecipe(recipeIngredients, userIngredients)
    expect(result.excluded).toBe(true)
    expect(result.score).toBe(0)
  })

  it('does NOT exclude when missing ingredient with weight 8', () => {
    const recipeIngredients = [
      { name: 'Rice', weight: 8 },
      { name: 'Soy Sauce', weight: 3 },
    ]
    const userIngredients = ['soy sauce']
    const result = scoreRecipe(recipeIngredients, userIngredients)
    expect(result.excluded).toBe(false)
    expect(result.score).toBeCloseTo(3 / 11)
  })

  it('matches ingredients case-insensitively', () => {
    const recipeIngredients = [
      { name: 'Olive Oil', weight: 5 },
    ]
    const userIngredients = ['olive oil']
    const result = scoreRecipe(recipeIngredients, userIngredients)
    expect(result.score).toBe(1.0)
  })

  it('returns score 0 when user has no matching ingredients and none are essential', () => {
    const recipeIngredients = [
      { name: 'Butter', weight: 5 },
      { name: 'Sugar', weight: 3 },
    ]
    const userIngredients = ['pasta', 'tomato']
    const result = scoreRecipe(recipeIngredients, userIngredients)
    expect(result.score).toBe(0)
    expect(result.excluded).toBe(false)
  })

  it('handles recipe with multiple essential ingredients', () => {
    const recipeIngredients = [
      { name: 'Chicken', weight: 10 },
      { name: 'Curry Paste', weight: 9 },
      { name: 'Coconut Milk', weight: 7 },
    ]
    const userIngredients = ['chicken', 'coconut milk']
    const result = scoreRecipe(recipeIngredients, userIngredients)
    expect(result.excluded).toBe(true)
    expect(result.score).toBe(0)
  })
})

describe('filterAndScoreRecipes', () => {
  const recipes = [
    {
      id: '1',
      title: 'Pasta Carbonara',
      ingredients: [
        { name: 'Pasta', weight: 10 },
        { name: 'Egg', weight: 8 },
        { name: 'Bacon', weight: 7 },
        { name: 'Parmesan', weight: 3 },
      ],
    },
    {
      id: '2',
      title: 'Tomato Soup',
      ingredients: [
        { name: 'Tomato', weight: 10 },
        { name: 'Onion', weight: 5 },
        { name: 'Basil', weight: 2 },
      ],
    },
    {
      id: '3',
      title: 'Grilled Chicken',
      ingredients: [
        { name: 'Chicken', weight: 10 },
        { name: 'Olive Oil', weight: 4 },
        { name: 'Lemon', weight: 2 },
      ],
    },
  ]

  it('returns recipes sorted by score descending', () => {
    const userIngredients = ['pasta', 'egg', 'bacon', 'tomato', 'onion']
    const results = filterAndScoreRecipes(recipes, userIngredients)
    expect(results).toHaveLength(2)
    expect(results[0].id).toBe('1')
    expect(results[1].id).toBe('2')
  })

  it('excludes recipes missing essential ingredients', () => {
    const userIngredients = ['egg', 'bacon', 'parmesan']
    const results = filterAndScoreRecipes(recipes, userIngredients)
    expect(results).toHaveLength(0)
  })

  it('returns empty array when user has no ingredients', () => {
    const results = filterAndScoreRecipes(recipes, [])
    expect(results).toHaveLength(0)
  })
})
