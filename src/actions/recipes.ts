'use server';

import { redirect } from "next/navigation";
import {
  createRecipe,
  getCountries as _getCountries,
  getIngredients as _getIngredients,
} from "@/lib/data/recipes.queries";
import { RecipeIngredient, RecipeInput, RecipeInstruction } from "@/types/recipes";
import { CreateRecipeSchema } from "@/validations/recipe.schema";

export async function getCountries() {
  return _getCountries();
}

export async function getIngredients(searchTerm: string) {
  return _getIngredients(searchTerm);
}

export async function createRecipeAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const country = formData.get("country") as string;
  const description = formData.get("description") as string;
  const imageInput = formData.get("image") as File | null;
  let ingredients = JSON.parse(formData.get("ingredients") as string) as RecipeIngredient[];
  let instructions = JSON.parse(formData.get("instructions") as string) as RecipeInstruction[];
  
  const preRecipe = {
    name,
    country,
    description,
    ingredients,
    instructions,
    imageInput
  }
  
  const validatedFields = CreateRecipeSchema.safeParse(preRecipe)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to create user.',
    };
  }
  const { data } = validatedFields
  const slug = await createRecipe(data as RecipeInput)

  redirect(`/recipes/details/${slug}`)
}
