'use client'

import { useRouter } from 'next/navigation'
import { getRandomRecipeSlug } from '@/actions/get-recipe'

export function SurpriseMealLink() {
  const router = useRouter()

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    const slug = await getRandomRecipeSlug()
    if (slug) {
      router.push(`/recipes/details/${slug}`)
    }
  }

  return (
    <li>
      <button
        onClick={handleClick}
        className="block py-2 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent lg:text-primary-700 lg:p-0 dark:text-white cursor-pointer"
      >
        Surprise Meal
      </button>
    </li>
  )
}
