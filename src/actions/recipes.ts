'use server';

import { uploadImage } from "@/lib/cloudinary";
import { createRecipe, searchIngredientsFromDB } from "@/lib/data/recipes.queries";
import { prisma } from "@/lib/prisma";
import { RecipeIngredient, RecipeInput, RecipeInstruction } from "@/types/recipes";
import { CreateRecipeSchema } from "@/validations/recipe.schema";

export const getCountries = async () => {
  return await prisma.country.findMany();
};

// To swap back to mock data, uncomment these and comment out the DB call:
// const mockIngredients = ["banana", "beans", "apple", "orange", "carrot", "potato", "algo", "algo mas"];

export async function getIngredients(searchTerm: string) {
  if (!searchTerm) return [];
  return searchIngredientsFromDB(searchTerm)

  // Mock version:
  // return mockIngredients.filter(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
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
  // console.log(validatedFields.data?.imageInput)
  // await uploadImage(validatedFields.data?.imageInput as unknown as File)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to create user.',
    };
  }
  const { data } = validatedFields
  await createRecipe(data as RecipeInput)

  return {};
}
