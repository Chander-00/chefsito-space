'use server'

import { auth } from '@/auth'
import { softDeleteRecipe, restoreRecipe, updateRecipe } from '@/lib/data/recipes.queries'
import { updateUserRole } from '@/lib/data/user.queries'
import { uploadImage } from '@/lib/cloudinary'
import { RecipeIngredient, RecipeInstruction } from '@/types/recipes'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')
  return session
}

export async function softDeleteRecipeAction(id: string) {
  await requireAdmin()
  await softDeleteRecipe(id)
  revalidatePath('/admin/recipes')
}

export async function restoreRecipeAction(id: string) {
  await requireAdmin()
  await restoreRecipe(id)
  revalidatePath('/admin/recipes')
}

export async function updateRecipeAction(
  _prevState: { errors: Record<string, string[]>; message: string },
  formData: FormData
): Promise<{ errors: Record<string, string[]>; message: string }> {
  await requireAdmin()

  const recipeId = formData.get('recipeId') as string
  const name = formData.get('name') as string
  const country = formData.get('country') as string
  const description = formData.get('description') as string
  const ingredients = JSON.parse(formData.get('ingredients') as string) as RecipeIngredient[]
  const instructions = JSON.parse(formData.get('instructions') as string) as RecipeInstruction[]
  const imageFile = formData.get('image') as File | null

  let imageUrl: string | undefined
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadImage(imageFile)
  }

  await updateRecipe(recipeId, {
    title: name,
    description,
    country,
    ingredients,
    instructions,
    image: imageUrl,
  })

  redirect('/admin/recipes')
}

export async function promoteUserAction(id: string) {
  await requireAdmin()
  await updateUserRole(id, 'ADMIN')
  revalidatePath('/admin/users')
}

export async function demoteUserAction(id: string) {
  const session = await requireAdmin()
  if (session.user.id === id) throw new Error('Cannot demote yourself')
  await updateUserRole(id, 'USER')
  revalidatePath('/admin/users')
}
