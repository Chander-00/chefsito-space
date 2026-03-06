import { auth } from "@/auth";
import { getRecipesPreview, getFavoriteIds } from "@/lib/data/fetch-recipes";
import { RecipeItem } from "./recipe-item";
import { Pagination } from "@/components/pagination";

const PER_PAGE = 25;

export async function RecipesGrid({
  query,
  currentPage = 1,
}: {
  query?: string;
  currentPage?: number;
}) {
  const [session, { recipes, total }] = await Promise.all([
    auth(),
    getRecipesPreview(query, currentPage, PER_PAGE),
  ]);

  const favoriteIds = session?.user?.id
    ? await getFavoriteIds(session.user.id)
    : [];
  const favoriteSet = new Set(favoriteIds);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="px-2 md:px-0">
      <ul className="columns-1 gap-6 space-y-6 sm:columns-2 md:columns-4">
        {recipes.map((recipe) => (
          <RecipeItem
            key={recipe.recipe_id}
            recipe={recipe}
            isFavorited={favoriteSet.has(recipe.recipe_id)}
            isSignedIn={!!session?.user}
          />
        ))}
      </ul>
      {recipes.length === 0 && (
        <p className="py-10 text-center text-gray-400">No recipes found.</p>
      )}
      <Pagination totalPages={totalPages} currentPage={currentPage} />
    </div>
  );
}
