# Weighted Ingredient Search - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a search page where users add ingredients they have, and see recipes ranked by weighted match score with a hard gate that excludes recipes missing essential ingredients (weight >= 9).

**Architecture:** Client component page at `/recipes/search` sends ingredient names to a server action. The server action fetches all recipes with their ingredients from the DB (currently mock data), runs the weighted Jaccard scoring algorithm, applies the hard gate filter, and returns sorted results. A pure-function scoring module keeps the algorithm testable.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Vitest (new), Prisma (existing), Zod (existing)

---

### Task 1: Set up Vitest

We need a testing framework to test the scoring algorithm. The project has none.

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add vitest + scripts)
- Modify: `tsconfig.json` (add vitest types)

**Step 1: Install vitest**

Run: `npm install -D vitest`

**Step 2: Create vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 3: Add test script to package.json**

Add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 4: Verify vitest works**

Run: `npx vitest run`
Expected: "No test files found" (no error, just no tests yet)

**Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest for testing"
```

---

### Task 2: Scoring algorithm — write tests first

The scoring algorithm is pure logic (no DB, no React). Write comprehensive tests before implementation.

**Files:**
- Create: `src/lib/utils/recipe-scoring.test.ts`

**Step 1: Write tests for the scoring function**

Create `src/lib/utils/recipe-scoring.test.ts`:

```typescript
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
    // Has pasta (10) and tomato (5), missing basil (2)
    // matchedWeight = 15, totalWeight = 17, score = 15/17
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
    // Missing pasta (weight 10 >= 9) → excluded
    const userIngredients = ['tomato', 'basil']
    const result = scoreRecipe(recipeIngredients, userIngredients)
    expect(result.excluded).toBe(true)
  })

  it('excludes recipe when missing ingredient with weight exactly 9', () => {
    const recipeIngredients = [
      { name: 'Rice', weight: 9 },
      { name: 'Soy Sauce', weight: 3 },
    ]
    const userIngredients = ['soy sauce']
    const result = scoreRecipe(recipeIngredients, userIngredients)
    expect(result.excluded).toBe(true)
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
    // Has chicken but missing curry paste (9) → excluded
    const userIngredients = ['chicken', 'coconut milk']
    const result = scoreRecipe(recipeIngredients, userIngredients)
    expect(result.excluded).toBe(true)
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
    // User has pasta, egg, bacon, tomato, onion
    const userIngredients = ['pasta', 'egg', 'bacon', 'tomato', 'onion']
    const results = filterAndScoreRecipes(recipes, userIngredients)

    // Pasta Carbonara: has 3/4 (pasta 10 + egg 8 + bacon 7 = 25/28)
    // Tomato Soup: has 2/3 (tomato 10 + onion 5 = 15/17)
    // Grilled Chicken: missing chicken (10) → excluded
    expect(results).toHaveLength(2)
    expect(results[0].id).toBe('1') // Carbonara scores higher
    expect(results[1].id).toBe('2') // Tomato Soup
  })

  it('excludes recipes missing essential ingredients', () => {
    const userIngredients = ['egg', 'bacon', 'parmesan']
    const results = filterAndScoreRecipes(recipes, userIngredients)
    // All three recipes are missing their essential ingredient
    // Pasta: missing Pasta (10) → excluded
    // Tomato Soup: missing Tomato (10) → excluded
    // Grilled Chicken: missing Chicken (10) → excluded
    expect(results).toHaveLength(0)
  })

  it('returns empty array when user has no ingredients', () => {
    const results = filterAndScoreRecipes(recipes, [])
    // All excluded because essential ingredients (weight 10) are missing
    expect(results).toHaveLength(0)
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run`
Expected: FAIL — module `./recipe-scoring` not found

---

### Task 3: Scoring algorithm — implement

**Files:**
- Create: `src/lib/utils/recipe-scoring.ts`

**Step 1: Implement the scoring functions**

Create `src/lib/utils/recipe-scoring.ts`:

```typescript
const ESSENTIAL_WEIGHT_THRESHOLD = 9

type ScoringIngredient = {
  name: string
  weight: number
}

type ScoringRecipe = {
  id: string
  title: string
  ingredients: ScoringIngredient[]
}

type ScoreResult = {
  score: number
  excluded: boolean
}

type ScoredRecipe = ScoringRecipe & {
  score: number
}

export function scoreRecipe(
  recipeIngredients: ScoringIngredient[],
  userIngredients: string[]
): ScoreResult {
  const userSet = new Set(userIngredients.map((i) => i.toLowerCase()))

  let totalWeight = 0
  let matchedWeight = 0

  for (const ingredient of recipeIngredients) {
    totalWeight += ingredient.weight
    const hasIngredient = userSet.has(ingredient.name.toLowerCase())

    if (hasIngredient) {
      matchedWeight += ingredient.weight
    } else if (ingredient.weight >= ESSENTIAL_WEIGHT_THRESHOLD) {
      return { score: 0, excluded: true }
    }
  }

  if (totalWeight === 0) return { score: 0, excluded: false }

  return { score: matchedWeight / totalWeight, excluded: false }
}

export function filterAndScoreRecipes(
  recipes: ScoringRecipe[],
  userIngredients: string[]
): ScoredRecipe[] {
  const scored: ScoredRecipe[] = []

  for (const recipe of recipes) {
    const { score, excluded } = scoreRecipe(recipe.ingredients, userIngredients)
    if (!excluded) {
      scored.push({ ...recipe, score })
    }
  }

  scored.sort((a, b) => b.score - a.score)
  return scored
}
```

**Step 2: Run tests to verify they pass**

Run: `npx vitest run`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add src/lib/utils/recipe-scoring.ts src/lib/utils/recipe-scoring.test.ts
git commit -m "feat: add weighted scoring algorithm with tests"
```

---

### Task 4: Server action for searching recipes

Create the server action that fetches recipes and runs the scoring algorithm. Since the app currently uses mock data for reads (see `src/lib/data/fetch-recipes.ts`), this action will also use mock data for now but structure the code so swapping to Prisma later is trivial.

**Files:**
- Create: `src/actions/search-recipes.ts`
- Modify: `src/mocks/recipes.mock.json` — update weights to meaningful values
- Modify: `src/routes.ts` — add `/recipes/search` to public routes

**Step 1: Update mock data with meaningful weights**

In `src/mocks/recipes.mock.json`, update the `weight` values for each recipe's ingredients to use the 1-10 scale. For example, in "Spaghetti Bolognese": Spaghetti → 10, Ground Beef → 9, Tomato Sauce → 6. Apply similar logic to all recipes. The key ingredients that define the dish get 9-10, supporting ingredients get 4-7, garnish/optional get 1-3.

**Step 2: Create the server action**

Create `src/actions/search-recipes.ts`:

```typescript
'use server'

import recipesData from '@/mocks/recipes.mock.json'
import { Recipe } from '@/types/recipes'
import { filterAndScoreRecipes } from '@/lib/utils/recipe-scoring'

const recipes: Recipe[] = recipesData

export type SearchResult = {
  recipe_id: string
  recipe_name: string
  recipe_slug: string
  recipe_image: string
  recipe_country: string
  creator_name: string
  score: number
}

export async function searchRecipesByIngredients(
  ingredientNames: string[]
): Promise<SearchResult[]> {
  if (ingredientNames.length === 0) return []

  // Transform mock data into the scoring format
  const recipesForScoring = recipes.map((recipe) => ({
    id: recipe.recipe_id,
    title: recipe.recipe_name,
    ingredients: recipe.recipe_ingredients.map((ing) => ({
      name: ing.name,
      weight: ing.weight,
    })),
  }))

  const scoredRecipes = filterAndScoreRecipes(recipesForScoring, ingredientNames)

  // Map back to the preview format with score
  return scoredRecipes.map((scored) => {
    const original = recipes.find((r) => r.recipe_id === scored.id)!
    return {
      recipe_id: original.recipe_id,
      recipe_name: original.recipe_name,
      recipe_slug: original.recipe_slug,
      recipe_image: original.recipe_image,
      recipe_country: original.recipe_country,
      creator_name: original.creator_name,
      score: Math.round(scored.score * 100),
    }
  })
}
```

**Step 3: Add `/recipes/search` to public routes**

In `src/routes.ts`, add `'/recipes/search'` to the `publicRoutes` array.

**Step 4: Commit**

```bash
git add src/actions/search-recipes.ts src/mocks/recipes.mock.json src/routes.ts
git commit -m "feat: add search-by-ingredients server action"
```

---

### Task 5: Search page — ingredient selector UI

Create the search page with the ingredient input and chip display.

**Files:**
- Create: `src/app/recipes/search/page.tsx`
- Create: `src/components/search/ingredient-selector.tsx`
- Create: `src/components/search/ingredient-chip.tsx`

**Step 1: Create the ingredient chip component**

Create `src/components/search/ingredient-chip.tsx`:

```typescript
'use client'

type IngredientChipProps = {
  name: string
  onRemove: () => void
}

export function IngredientChip({ name, onRemove }: IngredientChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-trinidad-500 bg-opacity-30 px-3 py-1 text-sm text-trinidad-100 border border-trinidad-500">
      {name}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 text-trinidad-300 hover:text-white transition-colors"
        aria-label={`Remove ${name}`}
      >
        &times;
      </button>
    </span>
  )
}
```

**Step 2: Create the ingredient selector component**

Create `src/components/search/ingredient-selector.tsx`:

This component reuses the autocomplete pattern from `src/components/recipes/ingredient-search.tsx` but simplified — no quantity/unit inputs, just ingredient name selection.

```typescript
'use client'

import { useState } from 'react'
import { getIngredients } from '@/actions/recipes'
import { IngredientChip } from './ingredient-chip'

type IngredientSelectorProps = {
  selectedIngredients: string[]
  onAdd: (name: string) => void
  onRemove: (index: number) => void
}

export function IngredientSelector({
  selectedIngredients,
  onAdd,
  onRemove,
}: IngredientSelectorProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])

  const fetchSuggestions = async (input: string) => {
    try {
      const results = await getIngredients(input)
      setSuggestions(results.filter((r) => !selectedIngredients.includes(r)))
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (value.trim()) {
      fetchSuggestions(value)
    } else {
      setSuggestions([])
    }
  }

  const handleAdd = (name: string) => {
    onAdd(name)
    setInputValue('')
    setSuggestions([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      handleAdd(inputValue.trim())
    }
  }

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type an ingredient name..."
          className="block w-full rounded-lg border border-gray-600 bg-transparent p-4 text-sm text-white placeholder-gray-400 focus:border-trinidad-500 focus:outline-none focus:ring-1 focus:ring-trinidad-500"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded border border-gray-600 bg-gray-900">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion}
                onClick={() => handleAdd(suggestion)}
                className="cursor-pointer p-2 text-white hover:bg-gray-700"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedIngredients.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedIngredients.map((name, index) => (
            <IngredientChip
              key={name}
              name={name}
              onRemove={() => onRemove(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 3: Create the search page**

Create `src/app/recipes/search/page.tsx`:

```typescript
import { Metadata } from 'next'
import { SearchPageClient } from '@/components/search/search-page-client'

export const metadata: Metadata = {
  title: 'Search by Ingredients - Chefsito Space',
}

export default function SearchByIngredientsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-24 pb-12">
      <h1 className="mb-2 text-3xl font-bold text-white">
        What can you cook?
      </h1>
      <p className="mb-8 text-gray-400">
        Add the ingredients you have and we&apos;ll find recipes you can make.
      </p>
      <SearchPageClient />
    </main>
  )
}
```

**Step 4: Commit**

```bash
git add src/app/recipes/search/page.tsx src/components/search/ingredient-chip.tsx src/components/search/ingredient-selector.tsx
git commit -m "feat: add ingredient selector UI for search page"
```

---

### Task 6: Search page — results display and wiring

Wire the ingredient selector to the server action and display scored results.

**Files:**
- Create: `src/components/search/search-page-client.tsx`
- Create: `src/components/search/search-result-item.tsx`

**Step 1: Create the search result item component**

Create `src/components/search/search-result-item.tsx`:

```typescript
import Image from 'next/image'
import Link from 'next/link'
import { SearchResult } from '@/actions/search-recipes'

export function SearchResultItem({ recipe }: { recipe: SearchResult }) {
  return (
    <li className="break-inside-avoid">
      <Link
        href={`/recipes/details/${recipe.recipe_slug}`}
        className="group relative block"
      >
        <div className="relative cursor-pointer before:absolute before:z-10 before:h-full before:w-full before:rounded-3xl before:opacity-50 hover:before:bg-gray-600">
          <Image
            src={recipe.recipe_image}
            alt={recipe.recipe_name}
            width={500}
            height={500}
            className="relative z-0 w-full cursor-pointer rounded-3xl object-cover transition-opacity duration-300 group-hover:opacity-20"
          />

          <div className="absolute top-3 right-3 z-20 rounded-full bg-trinidad-500 px-3 py-1 text-sm font-bold text-white">
            {recipe.score}% match
          </div>

          <div className="absolute bottom-4 left-4 z-20 flex flex-col items-start px-4 py-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <h3 className="text-lg font-bold text-white">
              {recipe.recipe_name}
            </h3>
            <p className="mt-1 text-sm text-gray-200">{recipe.creator_name}</p>
          </div>
        </div>
      </Link>
    </li>
  )
}
```

**Step 2: Create the client page component that wires everything**

Create `src/components/search/search-page-client.tsx`:

```typescript
'use client'

import { useState, useCallback } from 'react'
import { IngredientSelector } from './ingredient-selector'
import { SearchResultItem } from './search-result-item'
import {
  searchRecipesByIngredients,
  SearchResult,
} from '@/actions/search-recipes'

export function SearchPageClient() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const runSearch = useCallback(async (ingredients: string[]) => {
    if (ingredients.length === 0) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const scored = await searchRecipesByIngredients(ingredients)
      setResults(scored)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleAddIngredient = (name: string) => {
    if (selectedIngredients.includes(name)) return
    const updated = [...selectedIngredients, name]
    setSelectedIngredients(updated)
    runSearch(updated)
  }

  const handleRemoveIngredient = (index: number) => {
    const updated = selectedIngredients.filter((_, i) => i !== index)
    setSelectedIngredients(updated)
    runSearch(updated)
  }

  return (
    <div>
      <IngredientSelector
        selectedIngredients={selectedIngredients}
        onAdd={handleAddIngredient}
        onRemove={handleRemoveIngredient}
      />

      <section className="mt-10">
        {loading && (
          <p className="text-center text-gray-400">Searching recipes...</p>
        )}

        {!loading && selectedIngredients.length > 0 && results.length === 0 && (
          <p className="text-center text-gray-400">
            No recipes found with those ingredients. Try adding more.
          </p>
        )}

        {!loading && results.length > 0 && (
          <>
            <h2 className="mb-4 text-xl font-semibold text-white">
              {results.length} recipe{results.length !== 1 ? 's' : ''} found
            </h2>
            <ul className="columns-1 gap-6 space-y-6 sm:columns-2 md:columns-4">
              {results.map((recipe) => (
                <SearchResultItem
                  key={recipe.recipe_id}
                  recipe={recipe}
                />
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
```

**Step 3: Verify the page works**

Run: `npm run dev`
Navigate to: `http://localhost:3000/recipes/search`
Expected: Page loads with ingredient input. Adding ingredients shows scored results.

**Step 4: Commit**

```bash
git add src/components/search/search-page-client.tsx src/components/search/search-result-item.tsx
git commit -m "feat: wire search results with weighted scoring"
```

---

### Task 7: Update recipe creation form — weight input

Update the ingredient search component in the recipe creation form so users can set the weight (1-10) for each ingredient.

**Files:**
- Modify: `src/components/recipes/ingredient-search.tsx:45-53` — add weight input, remove hardcoded `weight: 1`
- Modify: `src/components/recipes/ingredients-display.tsx` — show weight in the display

**Step 1: Add weight input to ingredient-search.tsx**

Add a new state `const [ingredientWeight, setIngredientWeight] = useState<number>(5)` alongside the existing states.

In `handleAddIngredient`, change `weight: 1` to `weight: ingredientWeight`.

After the reset, also reset: `setIngredientWeight(5)`.

Add a number input (or range slider) for weight between the quantity/unit row and the Add button. Label it "Importance (1-10)" with `min={1}`, `max={10}`.

**Step 2: Show weight in ingredients-display.tsx**

In the `<span>` that shows `{ingredient.quantity} {ingredient.unit} of {ingredient.name}`, append the weight info: ` — importance: {ingredient.weight}/10`.

**Step 3: Verify in dev**

Run: `npm run dev`
Navigate to: `http://localhost:3000/recipes/new`
Expected: Weight slider/input appears when adding ingredients. Display shows the weight value.

**Step 4: Commit**

```bash
git add src/components/recipes/ingredient-search.tsx src/components/recipes/ingredients-display.tsx
git commit -m "feat: add weight input to recipe creation form"
```

---

### Task 8: Build verification

Make sure everything compiles and tests pass.

**Step 1: Run tests**

Run: `npx vitest run`
Expected: All scoring tests PASS

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 3: Run lint**

Run: `npm run lint`
Expected: No lint errors

**Step 4: Commit any fixes if needed, then final commit**

```bash
git commit -m "chore: verify build and tests pass"
```

---

## File Summary

| Action | File |
|--------|------|
| Create | `vitest.config.ts` |
| Create | `src/lib/utils/recipe-scoring.ts` |
| Create | `src/lib/utils/recipe-scoring.test.ts` |
| Create | `src/actions/search-recipes.ts` |
| Create | `src/app/recipes/search/page.tsx` |
| Create | `src/components/search/ingredient-chip.tsx` |
| Create | `src/components/search/ingredient-selector.tsx` |
| Create | `src/components/search/search-page-client.tsx` |
| Create | `src/components/search/search-result-item.tsx` |
| Modify | `package.json` (add vitest) |
| Modify | `src/routes.ts` (add public route) |
| Modify | `src/mocks/recipes.mock.json` (meaningful weights) |
| Modify | `src/components/recipes/ingredient-search.tsx` (weight input) |
| Modify | `src/components/recipes/ingredients-display.tsx` (show weight) |
