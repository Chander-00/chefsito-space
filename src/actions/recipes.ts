'use server';

import { redirect } from "next/navigation";
import { uploadImage } from "@/lib/cloudinary";
import { createRecipe } from "@/lib/data/recipes.queries";
import { prisma } from "@/lib/prisma";
import { RecipeIngredient, RecipeInput, RecipeInstruction } from "@/types/recipes";
import { CreateRecipeSchema } from "@/validations/recipe.schema";

export const getCountries = async () => {
  return await prisma.country.findMany();
};


// Mock data for demonstration
const mockIngredients = ["banana", "beans", "apple", "orange", "carrot", "potato", "algo", "algo mas"];

export async function getIngredients(searchTerm: string) {
  if (!searchTerm) return [];
  
  // Convert the search term to lower case for a case-insensitive comparison
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
  // Filter the mock data based on the search term
  const matchingIngredients = mockIngredients.filter(ingredient => 
    ingredient.toLowerCase().includes(lowerCaseSearchTerm)
  );

  return matchingIngredients;

  // --- Real DB implementation ---
  // const ingredients = await prisma.ingredient.findMany({
  //   where: {
  //     name: {
  //       contains: searchTerm,
  //       mode: 'insensitive',
  //     },
  //   },
  //   select: {
  //     name: true,
  //   },
  //   take: 10,
  // });
  //
  // return ingredients.map(ingredient => ingredient.name);

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
  const slug = await createRecipe(data as RecipeInput)

  redirect(`/recipes/details/${slug}`)
}
