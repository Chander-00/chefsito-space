'use server'

import { auth } from '@/auth'
import { softDeleteRecipe, restoreRecipe } from '@/lib/data/recipes.queries'
import { revalidatePath } from 'next/cache'

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
