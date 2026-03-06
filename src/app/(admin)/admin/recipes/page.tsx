import { getAdminRecipes } from '@/lib/data/recipes.queries'
import { AdminRecipeList } from '@/components/admin/admin-recipe-list'
import { Pagination } from '@/components/pagination'

const PER_PAGE = 25

export default async function AdminRecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; showDeleted?: string; page?: string }>
}) {
  const { query, showDeleted, page } = await searchParams
  const currentPage = Number(page) || 1
  const { recipes, total } = await getAdminRecipes(
    query,
    showDeleted === 'true',
    currentPage,
    PER_PAGE
  )
  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Recipes</h1>
      <AdminRecipeList
        recipes={recipes}
        query={query ?? ''}
        showDeleted={showDeleted === 'true'}
      />
      <Pagination totalPages={totalPages} currentPage={currentPage} />
    </div>
  )
}
