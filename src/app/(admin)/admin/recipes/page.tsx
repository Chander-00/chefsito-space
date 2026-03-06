import { getAdminRecipes } from '@/lib/data/recipes.queries'
import { AdminRecipeList } from '@/components/admin/admin-recipe-list'

export default async function AdminRecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; showDeleted?: string }>
}) {
  const { query, showDeleted } = await searchParams
  const recipes = await getAdminRecipes(query, showDeleted === 'true')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Recipes</h1>
      <AdminRecipeList
        recipes={recipes}
        query={query ?? ''}
        showDeleted={showDeleted === 'true'}
      />
    </div>
  )
}
