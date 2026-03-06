import { RecipeCard } from "@/components/recipe-details/recipe-card";
import { getRecipeBySlug } from "@/lib/data/fetch-recipes";
import { notFound } from "next/navigation";

interface RecipeDetailsPageProps {
  params: Promise<{ recipeSlug: string }>;
}

export default async function RecipeDetailsPage({
  params,
}: RecipeDetailsPageProps) {
  const { recipeSlug } = await params;
  const recipe = await getRecipeBySlug(recipeSlug);
  if (!recipe) {
    notFound();
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="container mx-auto px-4 py-8 h-full">
        <RecipeCard recipe={recipe} />
      </div>
    </div>
  );
}
