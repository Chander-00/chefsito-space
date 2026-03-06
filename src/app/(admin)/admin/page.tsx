import Link from "next/link"
import {
  getAdminStats,
  getMostFavoritedRecipes,
  getRecentRecipes,
} from "@/lib/data/recipes.queries"

export default async function AdminDashboardPage() {
  const [stats, mostFavorited, recentRecipes] = await Promise.all([
    getAdminStats(),
    getMostFavoritedRecipes(),
    getRecentRecipes(),
  ])

  const statCards = [
    { label: "Total Recipes", value: stats.totalRecipes },
    { label: "Total Users", value: stats.totalUsers },
    { label: "Total Favorites", value: stats.totalFavorites },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-gray-900 rounded-xl p-6">
            <p className="text-3xl font-bold text-trinidad-500">{card.value}</p>
            <p className="text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Most Favorited</h2>
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-white">#</th>
                <th className="px-4 py-3 text-white">Title</th>
                <th className="px-4 py-3 text-white">Creator</th>
                <th className="px-4 py-3 text-white text-right">Favorites</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {mostFavorited.map((recipe, i) => (
                <tr key={recipe.id} className="border-b border-gray-800 last:border-0">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">{recipe.title}</td>
                  <td className="px-4 py-3">{recipe.creator}</td>
                  <td className="px-4 py-3 text-right">{recipe.favoriteCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Recipes</h2>
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-white">Title</th>
                <th className="px-4 py-3 text-white">Creator</th>
                <th className="px-4 py-3 text-white">Country</th>
                <th className="px-4 py-3 text-white">Date</th>
                <th className="px-4 py-3 text-white"></th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {recentRecipes.map((recipe) => (
                <tr key={recipe.id} className="border-b border-gray-800 last:border-0">
                  <td className="px-4 py-3">{recipe.title}</td>
                  <td className="px-4 py-3">{recipe.creator}</td>
                  <td className="px-4 py-3">{recipe.country}</td>
                  <td className="px-4 py-3">{recipe.createdAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/recipes/${recipe.id}/edit`}
                      className="text-trinidad-500 hover:text-trinidad-400"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
