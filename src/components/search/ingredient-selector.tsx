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
          onBlur={() => setTimeout(() => setSuggestions([]), 150)}
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
