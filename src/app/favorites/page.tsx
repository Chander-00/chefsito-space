import { auth } from "@/auth";
import { getUserFavoriteRecipes } from "@/lib/data/recipes.queries";
import { RecipeItem } from "@/components/recipes/recipe-item";
import { Pagination } from "@/components/pagination";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Favorites - Chefsito Space",
};

const PER_PAGE = 25;

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 1;

  const { recipes, total } = await getUserFavoriteRecipes(
    session.user.id,
    currentPage,
    PER_PAGE
  );
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main className="mx-auto max-w-screen-xl px-4 pt-24 pb-12">
      <h1 className="mb-8 text-3xl font-bold text-white">My Favorites</h1>

      {recipes.length === 0 ? (
        <p className="text-center text-gray-400">
          You haven&apos;t favorited any recipes yet.
        </p>
      ) : (
        <>
          <ul className="columns-1 gap-6 space-y-6 sm:columns-2 md:columns-4">
            {recipes.map((recipe) => (
              <RecipeItem
                key={recipe.recipe_id}
                recipe={recipe}
                isFavorited={true}
                isSignedIn={true}
              />
            ))}
          </ul>
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </>
      )}
    </main>
  );
}
