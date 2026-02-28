# Weighted Ingredient Search - Design Document

## Problem

Users want to find recipes based on ingredients they have available. Unlike binary
ingredient matching (Supercook, MyFridgeFood), this search uses per-ingredient
importance weights to produce smarter results. A pasta recipe missing parsley
(weight 2) should still appear, but not if it's missing the pasta itself (weight 10).

## Algorithm: Weighted Jaccard Scoring with Hard Gate

### Scoring Formula

```
totalWeight = sum of all ingredient weights in recipe
matchedWeight = sum of weights for ingredients the user HAS
score = matchedWeight / totalWeight  (0.0 to 1.0)
```

### Hard Gate Rule

Any ingredient with `weight >= 9` that the user does NOT have → recipe is
excluded entirely. This prevents showing a "pasta recipe" when the user has
everything except pasta.

### Weight Scale

1-10 integer scale per ingredient:
- 10: Absolutely essential (the dish IS this ingredient)
- 9: Critical (missing this makes the recipe pointless)
- 5-8: Important but substitutable
- 1-4: Nice to have, garnish, optional

## Architecture

- **Page:** `/recipes/search` (public, no auth required)
- **Pattern:** Client component + Server action
- **Approach:** Server-side scoring (Approach A — fetch all recipes, score in JS)

### Data Flow

```
User adds ingredients → Client sends ingredient names to server action
→ Server fetches all recipes with RecipeIngredients from DB
→ Hard gate: exclude recipes missing any ingredient with weight >= 9
→ Score remaining recipes with weighted Jaccard
→ Return sorted results (highest score first) to client
```

### Existing Schema (no migration needed)

`RecipeIngredient` already has:
- `weight: Int` — importance (currently hardcoded to 1, needs real values)
- `quantity: Float` — amount (e.g. 2)
- `unit: String` — measure (e.g. "kg")

## UI Design

### Page Layout

Two sections:
1. **Ingredient Selector (top):** Autocomplete input reusing existing ingredient
   search pattern. Selected ingredients display as removable chips/tags.
2. **Results Grid (bottom):** Recipe cards sorted by match score. Each card shows
   match percentage (e.g. "92% match"). Updates as ingredients are added/removed.

### Recipe Creation Form Update

Add a weight input (1-10 slider or number input) when adding each ingredient.
Currently `weight` is hardcoded to `1` in `ingredient-search.tsx:51`.

## Out of Scope

- Saving pantry lists / user preferences
- Fuzzy ingredient name matching
- Pagination on results
- User-configurable threshold

## References

- [Weighted Jaccard Similarity](https://en.wikipedia.org/wiki/Jaccard_index)
- [Weighted Scoring Model](https://productschool.com/blog/product-fundamentals/weighted-scoring-model)
- [Recipe Recommendation Using Ingredient Networks](https://ar5iv.labs.arxiv.org/html/1111.3919)
