# Meal Plan & Shopping List Feature

## Overview

Allow users to select multiple recipes into a temporary "meal plan", then view an aggregated shopping list that combines and converts ingredient quantities intelligently. The list can be shared via WhatsApp or copied to clipboard.

## Decisions

- **State management**: React Context + localStorage. No new dependencies. Fits existing project patterns.
- **Persistence**: Temporary (browser session via localStorage). No database changes.
- **Sharing**: Text-based via WhatsApp (Web Share API with fallback) and copy-to-clipboard. Includes recipe names, links, and aggregated ingredient list.

## Data Flow

### MealPlanContext

A React Context provider wrapping the app. Holds:
- `recipes`: array of selected recipe objects (with full ingredient data, image, slug, title)
- `shoppingList`: `useMemo`-derived aggregated ingredient list, recalculated when recipes change
- `addRecipe(recipe)`, `removeRecipe(recipeId)`, `clearAll()`, `isInPlan(recipeId)` actions
- Syncs to `localStorage` on every change for cross-page persistence

### Ingredient Aggregation Algorithm

1. Collect all ingredients across all selected recipes
2. Group by ingredient name (case-insensitive, trimmed)
3. Within each group, convert quantities to a common base unit:
   - **Weight group**: g, kg, oz → base unit: grams
   - **Volume group**: ml, tsp, tbsp, cup → base unit: ml
   - **Count group**: pz, pcs → sum directly
4. Sum the base quantities
5. "Humanize" the result:
   - Weight: display as kg if >= 1000g, otherwise g
   - Volume: display as L if >= 1000ml, otherwise ml
   - Count: display as-is with original unit
6. If an ingredient appears with incompatible unit types (e.g., "flour: 500g" + "flour: 2 cup"), list as separate line items

### Unit Conversion Table

| Unit | Base Unit | Factor |
|------|-----------|--------|
| g    | g         | 1      |
| kg   | g         | 1000   |
| oz   | g         | 28.35  |
| ml   | ml        | 1      |
| tsp  | ml        | 5      |
| tbsp | ml        | 15     |
| cup  | ml        | 240    |
| pz   | pz        | 1      |
| pcs  | pz        | 1      |

## UI Components

### 1. Floating Cart Icon (`MealPlanFloatingButton`)

- Fixed position, bottom-right corner
- Badge showing count of selected recipes
- Hidden when count is 0
- **On click**: opens a slide-out drawer (not navigation)
- Trinidad orange theme

### 2. Slide-out Drawer (`MealPlanDrawer`)

- Shows list of added recipes: **thumbnail image + title + remove button** for each
- "View full shopping list" button at bottom → navigates to `/meal-plan`
- Backdrop overlay, close on outside click or X button

### 3. "Add to Meal Plan" Button

- **On recipe cards** (home/search grid): small icon button in card corner
- **On recipe detail page**: full toggle button ("Add to Meal Plan" / "Remove from Meal Plan")
- Visual feedback: filled icon when in plan, outline when not

### 4. Shopping List Page (`/meal-plan`)

**Desktop layout** (two columns):
- **Left column**: Selected recipes — image + title cards, each linking to recipe detail, with remove button
- **Right column**: Aggregated shopping list + action buttons

**Mobile layout** (stacked):
- Top: Selected recipes
- Bottom: Shopping list + actions

**Action buttons**:
- "Share via WhatsApp" — generates formatted text message with recipe links and shopping list
- "Copy to clipboard" — copies same text as plain text
- "Clear all" — removes all recipes from plan

### 5. Sharing Format

```
My Meal Plan (3 recipes)

Recipes:
- Pasta Bolognese — {siteUrl}/recipes/details/pasta-bolognese
- Caesar Salad — {siteUrl}/recipes/details/caesar-salad
- Chicken Curry — {siteUrl}/recipes/details/chicken-curry

Shopping List:
- Flour — 1kg
- Sugar — 200g
- Eggs — 4 pz
- Milk — 800ml
- Chicken — 400g
- Olive Oil — 20ml
```

## Files to Create/Modify

### New files
- `src/contexts/meal-plan-context.tsx` — Context provider + hook
- `src/lib/utils/ingredient-aggregator.ts` — Aggregation + unit conversion logic
- `src/components/meal-plan/floating-button.tsx` — Floating cart icon
- `src/components/meal-plan/drawer.tsx` — Slide-out drawer
- `src/components/meal-plan/add-to-plan-button.tsx` — Add/remove toggle button
- `src/components/meal-plan/shopping-list.tsx` — Shopping list display component
- `src/components/meal-plan/share-buttons.tsx` — WhatsApp + clipboard share buttons
- `src/app/meal-plan/page.tsx` — Shopping list page

### Modified files
- `src/app/layout.tsx` — Wrap with MealPlanContext provider, add FloatingButton
- `src/components/recipes/recipe-item.tsx` — Add "add to plan" icon button
- Recipe detail page component — Add "Add to Meal Plan" button

## Testing

- Unit tests for `ingredient-aggregator.ts` (aggregation, conversion, humanization, edge cases)
- Unit tests for MealPlanContext (add, remove, clear, localStorage sync)
