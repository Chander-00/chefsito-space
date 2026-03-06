import { auth } from "@/auth";
import { InlineRecipeActions } from "@/components/admin/inline-recipe-actions";
import { RecipeCard } from "@/components/recipe-details/recipe-card";
import { DetailFavButton } from "@/components/recipes/detail-fav-button";
import { ShareButton } from "@/components/recipes/share-button";
import { getRecipeBySlug } from "@/lib/data/fetch-recipes";
import { isRecipeFavorited } from "@/lib/data/recipes.queries";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface RecipeDetailsPageProps {
  params: Promise<{ recipeSlug: string }>;
}

export async function generateMetadata({
  params,
}: RecipeDetailsPageProps): Promise<Metadata> {
  const { recipeSlug } = await params;
  const recipe = await getRecipeBySlug(recipeSlug);

  if (!recipe) return { title: "Recipe Not Found" };

  return {
    title: recipe.recipe_name,
    description: recipe.recipe_description,
    openGraph: {
      title: recipe.recipe_name,
      description: recipe.recipe_description,
      images: [{ url: recipe.recipe_image, width: 500, height: 500 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.recipe_name,
      description: recipe.recipe_description,
      images: [recipe.recipe_image],
    },
  };
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
  const isFavorited = session?.user?.id
    ? await isRecipeFavorited(session.user.id, recipe.recipe_id)
    : false;

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="container mx-auto px-4 py-8 h-full">
        <div className="flex justify-end mb-4 gap-2">
          <ShareButton />
          {session?.user && (
            <DetailFavButton recipeId={recipe.recipe_id} initialFavorited={isFavorited} />
          )}
          {isAdmin && <InlineRecipeActions recipeId={recipe.recipe_id} />}
        </div>
        <RecipeCard recipe={recipe} />
      </div>
    </div>
  );
}
