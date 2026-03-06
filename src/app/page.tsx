import { RecipesGrid } from "@/components/recipes/recipes-grid";
import { Search } from "@/components/search";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anyone Can Cook",
  description: "Discover recipes from around the world. Search, cook, and share your favorites.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams?.query || "";
  const currentPage = Number(resolvedParams?.page) || 1;

  return (
    <main className="">
      <div className="max-w-xl pt-24 pb-24 mx-auto">
        <Search placeholder="Try to find something delicious to cook"></Search>
      </div>
      <section className="px-0 md:px-5">
        <h2 className="py-5 text-center text-3xl font-semibold md:text-left">
          Some of our recipes
        </h2>
        <RecipesGrid query={query} currentPage={currentPage} />
      </section>
    </main>
  );
}
