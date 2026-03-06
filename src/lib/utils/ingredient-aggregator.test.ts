import { describe, it, expect } from 'vitest'
import { RecipeIngredient } from '@/types/recipes'
import { convertToBase, humanize, aggregateIngredients, AggregatedIngredient } from './ingredient-aggregator'

describe('convertToBase', () => {
  it('converts grams to grams', () => {
    expect(convertToBase(500, 'g')).toEqual({ value: 500, group: 'weight' })
  })

  it('converts kg to grams', () => {
    expect(convertToBase(2, 'kg')).toEqual({ value: 2000, group: 'weight' })
  })

  it('converts oz to grams', () => {
    expect(convertToBase(1, 'oz')).toEqual({ value: 28.35, group: 'weight' })
  })

  it('converts ml to ml', () => {
    expect(convertToBase(500, 'ml')).toEqual({ value: 500, group: 'volume' })
  })

  it('converts tsp to ml', () => {
    expect(convertToBase(2, 'tsp')).toEqual({ value: 10, group: 'volume' })
  })

  it('converts tbsp to ml', () => {
    expect(convertToBase(3, 'tbsp')).toEqual({ value: 45, group: 'volume' })
  })

  it('converts cup to ml', () => {
    expect(convertToBase(1, 'cup')).toEqual({ value: 240, group: 'volume' })
  })

  it('treats pz as count', () => {
    expect(convertToBase(5, 'pz')).toEqual({ value: 5, group: 'count' })
  })

  it('treats pcs as count', () => {
    expect(convertToBase(3, 'pcs')).toEqual({ value: 3, group: 'count' })
  })

  it('treats unknown units as their own group', () => {
    expect(convertToBase(2, 'bunch')).toEqual({ value: 2, group: 'bunch' })
  })

  it('handles uppercase unit input', () => {
    expect(convertToBase(2, 'KG')).toEqual({ value: 2000, group: 'weight' })
  })

  it('handles mixed-case unit input', () => {
    expect(convertToBase(1, 'Tbsp')).toEqual({ value: 15, group: 'volume' })
  })
})

describe('humanize', () => {
  it('shows kg for >= 1000g', () => {
    expect(humanize(1500, 'weight')).toEqual({ quantity: 1.5, unit: 'kg' })
  })

  it('shows g for < 1000g', () => {
    expect(humanize(750, 'weight')).toEqual({ quantity: 750, unit: 'g' })
  })

  it('shows L for >= 1000ml', () => {
    expect(humanize(1200, 'volume')).toEqual({ quantity: 1.2, unit: 'L' })
  })

  it('shows ml for < 1000ml', () => {
    expect(humanize(500, 'volume')).toEqual({ quantity: 500, unit: 'ml' })
  })

  it('shows pz for count', () => {
    expect(humanize(7, 'count')).toEqual({ quantity: 7, unit: 'pz' })
  })

  it('passes through unknown groups', () => {
    expect(humanize(3, 'bunch')).toEqual({ quantity: 3, unit: 'bunch' })
  })
})

describe('aggregateIngredients', () => {
  it('sums same ingredient with same unit', () => {
    const ingredients: RecipeIngredient[] = [
      { name: 'Flour', unit: 'g', weight: 8, quantity: 500 },
      { name: 'Flour', unit: 'g', weight: 9, quantity: 200 },
    ]
    const result = aggregateIngredients(ingredients)
    expect(result).toEqual([
      { name: 'Flour', quantity: 700, unit: 'g' },
    ])
  })

  it('converts and sums compatible units (g + kg)', () => {
    const ingredients: RecipeIngredient[] = [
      { name: 'Sugar', unit: 'g', weight: 5, quantity: 250 },
      { name: 'Sugar', unit: 'kg', weight: 7, quantity: 1 },
    ]
    const result = aggregateIngredients(ingredients)
    expect(result).toEqual([
      { name: 'Sugar', quantity: 1.25, unit: 'kg' },
    ])
  })

  it('keeps incompatible units as separate entries', () => {
    const ingredients: RecipeIngredient[] = [
      { name: 'Flour', unit: 'g', weight: 8, quantity: 500 },
      { name: 'Flour', unit: 'cup', weight: 8, quantity: 2 },
    ]
    const result = aggregateIngredients(ingredients)
    // g → weight group, cup → volume group → incompatible → separate lines
    expect(result).toHaveLength(2)
    expect(result).toContainEqual({ name: 'Flour', quantity: 500, unit: 'g' })
    expect(result).toContainEqual({ name: 'Flour', quantity: 480, unit: 'ml' })
  })

  it('sums count-based ingredients', () => {
    const ingredients: RecipeIngredient[] = [
      { name: 'Eggs', unit: 'pz', weight: 10, quantity: 3 },
      { name: 'Eggs', unit: 'pcs', weight: 10, quantity: 2 },
    ]
    const result = aggregateIngredients(ingredients)
    expect(result).toEqual([
      { name: 'Eggs', quantity: 5, unit: 'pz' },
    ])
  })

  it('is case-insensitive on ingredient names', () => {
    const ingredients: RecipeIngredient[] = [
      { name: 'flour', unit: 'g', weight: 8, quantity: 200 },
      { name: 'Flour', unit: 'g', weight: 9, quantity: 300 },
    ]
    const result = aggregateIngredients(ingredients)
    expect(result).toEqual([
      { name: 'Flour', quantity: 500, unit: 'g' },
    ])
  })

  it('returns empty array for empty input', () => {
    expect(aggregateIngredients([])).toEqual([])
  })

  it('handles multiple different ingredients', () => {
    const ingredients: RecipeIngredient[] = [
      { name: 'Flour', unit: 'g', weight: 8, quantity: 500 },
      { name: 'Sugar', unit: 'g', weight: 5, quantity: 100 },
      { name: 'Eggs', unit: 'pz', weight: 10, quantity: 2 },
    ]
    const result = aggregateIngredients(ingredients)
    expect(result).toHaveLength(3)
  })
})
