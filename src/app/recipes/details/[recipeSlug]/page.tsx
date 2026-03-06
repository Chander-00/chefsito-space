import { auth } from "@/auth";
import { InlineRecipeActions } from "@/components/admin/inline-recipe-actions";
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
  const [session, recipe] = await Promise.all([
    auth(),
    getRecipeBySlug(recipeSlug),
  ]);

  if (!recipe) {
    notFound();
  }

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="container mx-auto px-4 py-8 h-full">
        {isAdmin && (
          <div className="flex justify-end mb-4">
            <InlineRecipeActions recipeId={recipe.recipe_id} />
          </div>
        )}
        <RecipeCard recipe={recipe} />
      </div>
    </div>
  );
}
