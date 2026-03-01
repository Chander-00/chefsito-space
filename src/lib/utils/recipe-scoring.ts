const ESSENTIAL_WEIGHT_THRESHOLD = 9

export type ScoringIngredient = {
  name: string
  weight: number
}

export type ScoringRecipe = {
  id: string
  title: string
  ingredients: ScoringIngredient[]
}

type ScoreResult = {
  score: number
  excluded: boolean
}

export type ScoredRecipe = ScoringRecipe & {
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
