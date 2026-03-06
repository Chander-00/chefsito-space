# Meal Plan & Shopping List Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users select recipes into a temporary meal plan, then view an aggregated shopping list with smart unit conversion and WhatsApp/clipboard sharing.

**Architecture:** React Context + localStorage for state. Pure utility function for ingredient aggregation. Floating button + drawer for quick access, dedicated `/meal-plan` page for the full experience. No new dependencies.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS (trinidad theme), Vitest, @heroicons/react for icons.

---

### Task 1: Ingredient Aggregator — Unit Conversion Tests

**Files:**
- Create: `src/lib/utils/ingredient-aggregator.test.ts`

**Step 1: Write the failing tests for unit conversion**

```typescript
import { describe, it, expect } from 'vitest'
import { convertToBase, humanize } from './ingredient-aggregator'

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
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/utils/ingredient-aggregator.test.ts`
Expected: FAIL — module not found

---

### Task 2: Ingredient Aggregator — Unit Conversion Implementation

**Files:**
- Create: `src/lib/utils/ingredient-aggregator.ts`

**Step 1: Implement convertToBase and humanize**

```typescript
import { RecipeIngredient } from '@/types/recipes'

type UnitGroup = 'weight' | 'volume' | 'count' | string

type BaseConversion = { value: number; group: UnitGroup }

type HumanizedQuantity = { quantity: number; unit: string }

const UNIT_MAP: Record<string, { factor: number; group: UnitGroup }> = {
  g:    { factor: 1,     group: 'weight' },
  kg:   { factor: 1000,  group: 'weight' },
  oz:   { factor: 28.35, group: 'weight' },
  ml:   { factor: 1,     group: 'volume' },
  tsp:  { factor: 5,     group: 'volume' },
  tbsp: { factor: 15,    group: 'volume' },
  cup:  { factor: 240,   group: 'volume' },
  pz:   { factor: 1,     group: 'count' },
  pcs:  { factor: 1,     group: 'count' },
}

export function convertToBase(quantity: number, unit: string): BaseConversion {
  const entry = UNIT_MAP[unit.toLowerCase()]
  if (!entry) return { value: quantity, group: unit.toLowerCase() }
  return { value: quantity * entry.factor, group: entry.group }
}

export function humanize(baseValue: number, group: UnitGroup): HumanizedQuantity {
  if (group === 'weight') {
    if (baseValue >= 1000) return { quantity: parseFloat((baseValue / 1000).toFixed(2)), unit: 'kg' }
    return { quantity: parseFloat(baseValue.toFixed(2)), unit: 'g' }
  }
  if (group === 'volume') {
    if (baseValue >= 1000) return { quantity: parseFloat((baseValue / 1000).toFixed(2)), unit: 'L' }
    return { quantity: parseFloat(baseValue.toFixed(2)), unit: 'ml' }
  }
  if (group === 'count') return { quantity: baseValue, unit: 'pz' }
  return { quantity: baseValue, unit: group }
}
```

**Step 2: Run tests to verify they pass**

Run: `npx vitest run src/lib/utils/ingredient-aggregator.test.ts`
Expected: ALL PASS

**Step 3: Commit**

```bash
git add src/lib/utils/ingredient-aggregator.ts src/lib/utils/ingredient-aggregator.test.ts
git commit -m "feat: add unit conversion utilities for ingredient aggregator"
```

---

### Task 3: Ingredient Aggregator — Aggregation Tests

**Files:**
- Modify: `src/lib/utils/ingredient-aggregator.test.ts`

**Step 1: Add aggregation tests**

Append to the test file:

```typescript
import { aggregateIngredients, AggregatedIngredient } from './ingredient-aggregator'

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
    // Both are volume/weight convertible, so they should merge
    // g → weight group, cup → volume group → incompatible → separate
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
```

Also add the `RecipeIngredient` import at the top if not already present:

```typescript
import { RecipeIngredient } from '@/types/recipes'
```

**Step 2: Run tests to verify new tests fail**

Run: `npx vitest run src/lib/utils/ingredient-aggregator.test.ts`
Expected: New `aggregateIngredients` tests FAIL — function not exported

---

### Task 4: Ingredient Aggregator — Aggregation Implementation

**Files:**
- Modify: `src/lib/utils/ingredient-aggregator.ts`

**Step 1: Add aggregateIngredients and AggregatedIngredient type**

Append to the existing file:

```typescript
export type AggregatedIngredient = {
  name: string
  quantity: number
  unit: string
}

export function aggregateIngredients(
  ingredients: RecipeIngredient[]
): AggregatedIngredient[] {
  if (ingredients.length === 0) return []

  // Group by lowercase name + unit group
  const groups = new Map<string, { name: string; baseValue: number; group: UnitGroup }>()

  for (const ing of ingredients) {
    const { value, group } = convertToBase(ing.quantity, ing.unit)
    const key = `${ing.name.toLowerCase().trim()}::${group}`

    const existing = groups.get(key)
    if (existing) {
      existing.baseValue += value
    } else {
      groups.set(key, { name: ing.name.trim(), baseValue: value, group })
    }
  }

  const result: AggregatedIngredient[] = []
  for (const entry of groups.values()) {
    const { quantity, unit } = humanize(entry.baseValue, entry.group)
    result.push({ name: entry.name, quantity, unit })
  }

  return result
}
```

**Step 2: Run tests to verify they all pass**

Run: `npx vitest run src/lib/utils/ingredient-aggregator.test.ts`
Expected: ALL PASS

**Step 3: Commit**

```bash
git add src/lib/utils/ingredient-aggregator.ts src/lib/utils/ingredient-aggregator.test.ts
git commit -m "feat: add ingredient aggregation with unit conversion"
```

---

### Task 5: MealPlanContext — Tests

**Files:**
- Create: `src/contexts/meal-plan-context.test.tsx`

Note: This task tests the context logic. Since context requires React rendering, we test via a small test harness. Install no new dependencies — vitest already supports JSX via the project's TypeScript config.

**Step 1: Write the failing tests**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from 'vitest' // won't work — see step 2
```

Actually, since there's no `@testing-library/react` in the project and adding it would be a new dependency, we'll test the **extracted pure logic** instead. The context will be thin wrapper. Let's test the reducer/state logic as a pure function.

Create `src/contexts/meal-plan-context.test.ts`:

```typescript
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
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/contexts/meal-plan-context.test.ts`
Expected: FAIL — module not found

---

### Task 6: MealPlanContext — Implementation

**Files:**
- Create: `src/contexts/meal-plan-context.tsx`

**Step 1: Implement the context**

```tsx
'use client'

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
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
  }, [])

  // Sync to localStorage on change
  useEffect(() => {
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
```

**Step 2: Run tests to verify they pass**

Run: `npx vitest run src/contexts/meal-plan-context.test.ts`
Expected: ALL PASS

**Step 3: Commit**

```bash
git add src/contexts/meal-plan-context.tsx src/contexts/meal-plan-context.test.ts
git commit -m "feat: add MealPlanContext with reducer and localStorage sync"
```

---

### Task 7: Wire MealPlanProvider into Layout

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Add the provider**

The layout is a server component, so we need a client wrapper. Create a providers component:

Create `src/app/providers.tsx`:

```tsx
'use client'

import { MealPlanProvider } from '@/contexts/meal-plan-context'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return <MealPlanProvider>{children}</MealPlanProvider>
}
```

**Step 2: Modify layout.tsx**

In `src/app/layout.tsx`, add the import and wrap children:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainHeader from "@/components/mainHeader/header";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark`}>
        <Providers>
          <MainHeader></MainHeader>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**Step 3: Verify the app still builds**

Run: `npx next build` (or `npm run build`)
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/app/providers.tsx src/app/layout.tsx
git commit -m "feat: wire MealPlanProvider into app layout"
```

---

### Task 8: Add-to-Plan Button Component

**Files:**
- Create: `src/components/meal-plan/add-to-plan-button.tsx`

**Step 1: Create the button component**

This button works in two modes: icon-only (for recipe cards) and full (for detail pages).

```tsx
'use client'

import { useMealPlan } from '@/contexts/meal-plan-context'
import { Recipe } from '@/types/recipes'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { ShoppingCartIcon as ShoppingCartSolidIcon } from '@heroicons/react/24/solid'

type AddToPlanButtonProps = {
  recipe: Recipe
  variant?: 'icon' | 'full'
}

export function AddToPlanButton({ recipe, variant = 'icon' }: AddToPlanButtonProps) {
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

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className="absolute left-4 top-4 z-30 rounded-full bg-trinidad-500 p-2 text-white opacity-0 transition-all hover:bg-trinidad-600 group-hover:opacity-100"
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
```

**Step 2: Commit**

```bash
git add src/components/meal-plan/add-to-plan-button.tsx
git commit -m "feat: add AddToPlanButton component (icon + full variants)"
```

---

### Task 9: Add Button to Recipe Cards

**Files:**
- Modify: `src/components/recipes/recipe-item.tsx`
- Modify: `src/components/search/search-result-item.tsx`

The recipe cards currently use `RecipePreview` which does NOT include `recipe_ingredients`. The `AddToPlanButton` needs the full `Recipe` to store ingredient data. We have two options:

**Option chosen:** Fetch full recipe data on-demand when the button is clicked, OR pass full recipe data to the cards. Since the data currently comes from mock JSON and is available server-side, we'll need to adjust. The simplest approach: add a server action that gets a recipe by ID, and call it when adding to the plan.

**Step 1: Create server action to get full recipe by ID**

Create `src/actions/get-recipe.ts`:

```typescript
'use server'

import { getRecipeBySlug } from '@/lib/data/fetch-recipes'
import recipesData from '@/mocks/recipes.mock.json'
import { Recipe } from '@/types/recipes'

const recipes: Recipe[] = recipesData

export async function getRecipeById(id: string): Promise<Recipe | null> {
  return recipes.find((r) => r.recipe_id === id) ?? null
}
```

**Step 2: Create a wrapper button for recipe cards that fetches on click**

Create `src/components/meal-plan/add-to-plan-card-button.tsx`:

```tsx
'use client'

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

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inPlan) {
      removeRecipe(recipeId)
    } else {
      const recipe = await getRecipeById(recipeId)
      if (recipe) addRecipe(recipe)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="absolute left-4 top-4 z-30 rounded-full bg-trinidad-500 p-2 text-white opacity-0 transition-all hover:bg-trinidad-600 group-hover:opacity-100"
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
```

**Step 3: Add button to recipe-item.tsx**

Modify `src/components/recipes/recipe-item.tsx`. Add the import and button next to `FavButton`:

Current code has `<FavButton />` inside the card div. Add `<AddToPlanCardButton>` next to it:

```typescript
import { RecipePreview } from "@/types/recipes";
import Image from "next/image";
import Link from "next/link";
import { FavButton } from "./add-to-fav-button";
import { AddToPlanCardButton } from "@/components/meal-plan/add-to-plan-card-button";

export function RecipeItem({ recipe }: { recipe: RecipePreview }) {
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

          <div className="absolute bottom-4 left-4 z-20 flex flex-col items-start px-4 py-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <h3 className="text-lg font-bold text-white">
              {recipe.recipe_name}
            </h3>
            <p className="mt-1 text-sm text-gray-200">{recipe.creator_name}</p>
          </div>

          <FavButton />
          <AddToPlanCardButton recipeId={recipe.recipe_id} />
        </div>
      </Link>
    </li>
  );
}
```

**Step 4: Add button to search-result-item.tsx**

Modify `src/components/search/search-result-item.tsx` similarly — add the import and button:

```typescript
import Image from 'next/image'
import Link from 'next/link'
import { SearchResult } from '@/actions/search-recipes'
import { AddToPlanCardButton } from '@/components/meal-plan/add-to-plan-card-button'

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

          <AddToPlanCardButton recipeId={recipe.recipe_id} />
        </div>
      </Link>
    </li>
  )
}
```

**Step 5: Verify the app still builds**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/actions/get-recipe.ts src/components/meal-plan/add-to-plan-card-button.tsx src/components/recipes/recipe-item.tsx src/components/search/search-result-item.tsx
git commit -m "feat: add meal plan button to recipe cards and search results"
```

---

### Task 10: Add Button to Recipe Detail Page

**Files:**
- Modify: `src/components/recipe-details/recipe-card.tsx`

**Step 1: Add the full-variant button to the recipe detail card**

The `RecipeCard` component receives a full `Recipe` object, so we can use `AddToPlanButton` directly.

Modify `src/components/recipe-details/recipe-card.tsx`:

```typescript
import { Recipe } from "@/types/recipes";
import React from "react";
import { RecipeImage } from "./recipe-image";
import { RecipeHeader } from "./recipe-header";
import { RecipeCreator } from "./recipe-creator-section";
import { RecipeDetails } from "./recipe-component";
import { AddToPlanButton } from "@/components/meal-plan/add-to-plan-button";

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => (
  <div className="max-w-5xl mx-auto shadow-md p-4 rounded-lg overflow-hidden">
    <div className="md:flex">
      <RecipeImage src={recipe.recipe_image} alt={recipe.recipe_name} />
      <div className="md:w-1/2 p-6">
        <div className="flex flex-col h-full justify-between">
          <div>
            <RecipeHeader
              name={recipe.recipe_name}
              country={recipe.recipe_country}
            />
            <p className="text-trinidad-100 mb-6">
              {recipe.recipe_description}
            </p>
            <AddToPlanButton recipe={recipe} variant="full" />
          </div>
          <RecipeCreator creatorName={recipe.creator_name} />
        </div>
      </div>
    </div>
    <RecipeDetails
      ingredients={recipe.recipe_ingredients}
      instructions={recipe.recipe_instructions}
    />
  </div>
);
```

**Step 2: Verify the app still builds**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/recipe-details/recipe-card.tsx
git commit -m "feat: add meal plan button to recipe detail page"
```

---

### Task 11: Floating Button + Drawer

**Files:**
- Create: `src/components/meal-plan/floating-button.tsx`
- Create: `src/components/meal-plan/drawer.tsx`
- Modify: `src/app/providers.tsx` (add floating button here since it needs context)

**Step 1: Create the drawer component**

Create `src/components/meal-plan/drawer.tsx`:

```tsx
'use client'

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

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col bg-gray-900 shadow-xl">
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
```

**Step 2: Create the floating button**

Create `src/components/meal-plan/floating-button.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useMealPlan } from '@/contexts/meal-plan-context'
import { ShoppingCartIcon } from '@heroicons/react/24/solid'
import { MealPlanDrawer } from './drawer'

export function MealPlanFloatingButton() {
  const { recipes } = useMealPlan()
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (recipes.length === 0) return null

  return (
    <>
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-trinidad-500 p-4 text-white shadow-lg transition-transform hover:scale-105 hover:bg-trinidad-600"
        title="View meal plan"
      >
        <ShoppingCartIcon className="h-6 w-6" />
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-trinidad-600">
          {recipes.length}
        </span>
      </button>

      <MealPlanDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  )
}
```

**Step 3: Add floating button to providers.tsx**

Modify `src/app/providers.tsx`:

```tsx
'use client'

import { MealPlanProvider } from '@/contexts/meal-plan-context'
import { MealPlanFloatingButton } from '@/components/meal-plan/floating-button'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MealPlanProvider>
      {children}
      <MealPlanFloatingButton />
    </MealPlanProvider>
  )
}
```

**Step 4: Verify the app still builds**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/components/meal-plan/floating-button.tsx src/components/meal-plan/drawer.tsx src/app/providers.tsx
git commit -m "feat: add floating meal plan button with slide-out drawer"
```

---

### Task 12: Share Utility

**Files:**
- Create: `src/lib/utils/meal-plan-share.ts`
- Create: `src/lib/utils/meal-plan-share.test.ts`

**Step 1: Write failing test**

Create `src/lib/utils/meal-plan-share.test.ts`:

```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/utils/meal-plan-share.test.ts`
Expected: FAIL — module not found

**Step 3: Implement**

Create `src/lib/utils/meal-plan-share.ts`:

```typescript
import { Recipe } from '@/types/recipes'
import { AggregatedIngredient } from './ingredient-aggregator'

export function generateShareText(
  recipes: Recipe[],
  shoppingList: AggregatedIngredient[],
  baseUrl: string
): string {
  const recipeCount = recipes.length
  const header = `My Meal Plan (${recipeCount} recipe${recipeCount !== 1 ? 's' : ''})`

  const recipeLines = recipes
    .map((r) => `- ${r.recipe_name} — ${baseUrl}/recipes/details/${r.recipe_slug}`)
    .join('\n')

  const ingredientLines = shoppingList
    .map((item) => `- ${item.name} — ${item.quantity}${item.unit}`)
    .join('\n')

  return `${header}\n\nRecipes:\n${recipeLines}\n\nShopping List:\n${ingredientLines}`
}

export function shareViaWhatsApp(text: string) {
  const encoded = encodeURIComponent(text)
  window.open(`https://wa.me/?text=${encoded}`, '_blank')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
```

**Step 4: Run tests**

Run: `npx vitest run src/lib/utils/meal-plan-share.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/lib/utils/meal-plan-share.ts src/lib/utils/meal-plan-share.test.ts
git commit -m "feat: add share text generation and sharing utilities"
```

---

### Task 13: Shopping List Page

**Files:**
- Create: `src/app/meal-plan/page.tsx`

**Step 1: Create the meal plan page**

This is a client component since it reads from MealPlanContext.

Create `src/app/meal-plan/page.tsx`:

```tsx
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
```

**Step 2: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/meal-plan/page.tsx
git commit -m "feat: add meal plan shopping list page with responsive layout"
```

---

### Task 14: Run All Tests

**Files:** None — verification only.

**Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: ALL PASS (ingredient-aggregator tests + meal-plan-context reducer tests + share text tests)

**Step 2: Run the build**

Run: `npm run build`
Expected: Build succeeds with no errors

---

### Task 15: Final Verification & Manual Testing Checklist

Manually verify these flows in the browser (`npm run dev`):

1. **Home page**: Recipe cards show the shopping cart icon on hover (top-left)
2. **Click add**: Icon fills in (solid) when recipe is in plan
3. **Floating button**: Appears bottom-right with recipe count badge after adding a recipe
4. **Drawer**: Opens when clicking floating button, shows recipe thumbnails + titles + remove buttons
5. **Recipe detail page**: "Add to Meal Plan" full button visible and toggles
6. **`/meal-plan` page**:
   - Desktop: two-column layout (recipes left, shopping list right)
   - Mobile: stacked layout
   - Aggregated quantities are correct (e.g., Flour from 2 recipes sums properly)
   - Unit conversion works (250g + 750g → 1kg)
   - Remove individual recipes updates the list
   - "Clear All" empties everything
7. **WhatsApp share**: Opens WhatsApp with formatted text including recipe names, links, and shopping list
8. **Copy to clipboard**: Copies text and shows "Copied!" feedback
9. **Persistence**: Add recipes, refresh page — recipes are still in the plan (localStorage)
