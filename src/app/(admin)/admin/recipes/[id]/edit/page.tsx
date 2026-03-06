import { notFound } from 'next/navigation'
import { getRecipeByIdFromDB } from '@/lib/data/recipes.queries'
import EditRecipeForm from '@/components/forms/edit-recipe-form'

export default async function AdminEditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const recipe = await getRecipeByIdFromDB(id)

  if (!recipe) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Recipe</h1>
      <EditRecipeForm recipe={recipe} />
    </div>
  )
}
