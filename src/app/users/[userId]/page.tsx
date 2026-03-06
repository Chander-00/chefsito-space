import { auth } from "@/auth";
import { getUserProfile, getUserRecipes } from "@/lib/data/user.queries";
import { getFavoriteIds } from "@/lib/data/fetch-recipes";
import { RecipeItem } from "@/components/recipes/recipe-item";
import { Pagination } from "@/components/pagination";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";

const PER_PAGE = 25;

interface UserProfilePageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: UserProfilePageProps): Promise<Metadata> {
  const { userId } = await params;
  const user = await getUserProfile(userId);
  if (!user) return { title: "User Not Found" };

  return {
    title: `${user.name ?? "Chef"}'s Profile`,
    description: `Check out ${user.name ?? "this chef"}'s recipes on Chefsito Space.`,
  };
}

export default async function UserProfilePage({
  params,
  searchParams,
}: UserProfilePageProps) {
  const { userId } = await params;
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 1;

  const user = await getUserProfile(userId);
  if (!user) notFound();

  const [session, { recipes, total }] = await Promise.all([
    auth(),
    getUserRecipes(userId, currentPage, PER_PAGE),
  ]);

  const favoriteIds = session?.user?.id
    ? await getFavoriteIds(session.user.id)
    : [];
  const favoriteSet = new Set(favoriteIds);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main className="mx-auto max-w-screen-xl px-4 pt-24 pb-12">
      <div className="mb-10 flex items-center gap-6">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "User"}
            width={80}
            height={80}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-trinidad-500 text-2xl font-bold text-white">
            {(user.name ?? "?")[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-white">
            {user.name ?? "Anonymous Chef"}
          </h1>
          <p className="mt-1 text-gray-400">
            {user._count.Recipe} recipe{user._count.Recipe !== 1 ? "s" : ""}
            {" · "}
            {user._count.Favorite} favorite{user._count.Favorite !== 1 ? "s" : ""}
            {" · Joined "}
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <h2 className="mb-6 text-xl font-semibold text-white">Recipes</h2>

      {recipes.length === 0 ? (
        <p className="text-gray-400">No recipes yet.</p>
      ) : (
        <>
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
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </>
      )}
    </main>
  );
}
