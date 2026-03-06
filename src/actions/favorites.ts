'use server'

import { auth } from '@/auth'
import { toggleFavorite } from '@/lib/data/recipes.queries'
import { revalidatePath } from 'next/cache'

export async function toggleFavoriteAction(recipeId: string): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const isFavorited = await toggleFavorite(session.user.id, recipeId)
  revalidatePath('/')
  return isFavorited
}
