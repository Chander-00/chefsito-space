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
