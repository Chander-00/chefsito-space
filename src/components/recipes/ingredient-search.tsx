"use client";
import { getIngredients } from "@/actions/recipes";
import { RecipeIngredient } from "@/types/recipes";
import { useState, useRef, useCallback } from "react";
import GenerateUnitsOptions from "./gen-options";

interface IngredientSearchProps {
  onIngredientAdd: (ingredient: RecipeIngredient) => void;
  alreadyContainIngredients: boolean;
  errors?: string[];
}

const IngredientSearch = ({
  onIngredientAdd,
  alreadyContainIngredients,
  errors,
}: IngredientSearchProps) => {
  const [ingredientName, setIngredientName] = useState<string>("");
  const [ingredientQuantity, setIngredientQuantity] = useState<number>(0);
  const [ingredientUnit, setIngredientUnit] = useState<string>("g");
  const [ingredientWeight, setIngredientWeight] = useState<number>(5);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (input: string) => {
    try {
      const existingIngredients = await getIngredients(input);
      setSuggestions(existingIngredients);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, []);

  const handleIngredientNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setIngredientName(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (value.trim()) {
      debounceTimer.current = setTimeout(() => fetchSuggestions(value), 300);
    } else {
      setSuggestions([]);
    }
  };

  const handleAddIngredient = () => {
    if (ingredientName.trim() && ingredientQuantity > 0) {
      // If the typed name exactly matches a suggestion (case-insensitive),
      // use the suggestion's casing to avoid duplicates like "potato" vs "Potato"
      let resolvedName = ingredientName.trim();
      if (suggestions.length > 0) {
        const exactMatch = suggestions.find(
          (s) => s.toLowerCase() === resolvedName.toLowerCase()
        );
        if (exactMatch) {
          resolvedName = exactMatch;
        }
      }

      const newIngredient: RecipeIngredient = {
        name: resolvedName,
        quantity: ingredientQuantity,
        unit: ingredientUnit,
        weight: ingredientWeight,
      };
      onIngredientAdd(newIngredient);

      setIngredientName("");
      setIngredientQuantity(0);
      setIngredientUnit("kg");
      setIngredientWeight(5);
      setSuggestions([]);
    }
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    setIngredientName(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="mb-4">
      <label className="block text-trinidad-100 text-sm font-bold mb-4">
        Ingredients
      </label>
      <div aria-live="polite" aria-atomic="true" className="my-4">
        {errors?.map((error: string) => (
          <p className="mt-2 text-sm text-red-500" key={error}>
            {error}
          </p>
        ))}
      </div>
      <div className="relative z-0 w-full mb-5 group">
        <input
          type="text"
          name="ingredient_name"
          value={ingredientName}
          onChange={handleIngredientNameChange}
          className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-white leading-tight focus:border-trinidad-600 focus:outline-none focus:ring-0"
          placeholder=" "
          required={!alreadyContainIngredients}
        />
        <label
          htmlFor="ingredient_name"
          className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-trinidad-600 rtl:peer-focus:translate-x-1/4 dark:text-gray-400 peer-focus:dark:text-trinidad-600"
        >
          Ingredient Name
        </label>
        {suggestions.length > 0 && (
          <ul className="absolute bg-black border border-gray-600 rounded w-full mt-1 z-10">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="cursor-pointer p-2 hover:bg-gray-700 text-white"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex mb-2 gap-4">
        <input
          type="number"
          name="ingredient_quantity"
          value={ingredientQuantity}
          onChange={(e) => setIngredientQuantity(Number(e.target.value))}
          className="peer block w-1/2 appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-white leading-tight focus:border-trinidad-600 focus:outline-none focus:ring-0 mr-2"
          placeholder=" "
          min="0"
          required
        />
        <label
          htmlFor="ingredient_quantity"
          className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-trinidad-600 rtl:peer-focus:translate-x-1/4 dark:text-gray-400 peer-focus:dark:text-trinidad-600"
        >
          Quantity
        </label>
        <select
          value={ingredientUnit}
          name="ingredient_unit"
          onChange={(e) => setIngredientUnit(e.target.value)}
          className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-trinidad-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-trinidad-600"
        >
          <GenerateUnitsOptions />
        </select>
        <select
          value={ingredientWeight}
          name="ingredient_weight"
          onChange={(e) => setIngredientWeight(Number(e.target.value))}
          className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-white focus:border-trinidad-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:focus:border-trinidad-600"
        >
          <option value={2} className="bg-gray-900">Optional — nice to have</option>
          <option value={5} className="bg-gray-900">Important — adds to the dish</option>
          <option value={8} className="bg-gray-900">Key — defines the dish</option>
          <option value={10} className="bg-gray-900">Essential — can&apos;t make it without</option>
        </select>
        <button
          type="button"
          onClick={handleAddIngredient}
          className="border-2 border-trinidad-500 py-2 px-4 md:mb-0 mb-4 rounded-md cursor-pointer bg-transparent text-trinidad-500 hover:bg-trinidad-500 hover:text-white focus:bg-trinidad-500 focus:text-white transition-colors duration-300"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default IngredientSearch;
