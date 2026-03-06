"use client";

import { RecipeIngredient } from "@/types/recipes";

interface DisplayIngredientesProps {
  ingredients: RecipeIngredient[]; // Define the props interface
  handleRemoveIngredient: (index: number) => void; // Prop to handle removal
}

export default function DisplayIngredientes({
  ingredients,
  handleRemoveIngredient,
}: DisplayIngredientesProps) {
  return (
    ingredients.length > 0 && (
      <div className="mb-4">
        <h3 className="font-bold mb-2 text-lg text-white">
          Chosen Ingredients:
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          {ingredients.map((ingredient: RecipeIngredient, index) => (
            <li
              key={index}
              className="flex items-center justify-between bg-slate-500 p-2 rounded mb-1"
            >
              <span className="text-trinidad-100">
                {ingredient.quantity} {ingredient.unit} of {ingredient.name} — importance: {ingredient.weight}/10
              </span>
              <button
                type="button"
                onClick={() => handleRemoveIngredient(index)}
                className="text-red-700 hover:text-red-700 focus:outline-none"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  );
}
