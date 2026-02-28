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
            <AddToPlanButton recipe={recipe} />
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
