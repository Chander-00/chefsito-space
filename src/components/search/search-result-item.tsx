import Image from 'next/image'
import Link from 'next/link'
import { SearchResult } from '@/actions/search-recipes'
import { AddToPlanCardButton } from '@/components/meal-plan/add-to-plan-card-button'

export function SearchResultItem({ recipe }: { recipe: SearchResult }) {
  return (
    <li className="break-inside-avoid">
      <Link
        href={`/recipes/details/${recipe.recipe_slug}`}
        className="group relative block"
      >
        <div className="relative cursor-pointer before:absolute before:z-10 before:h-full before:w-full before:rounded-3xl before:opacity-50 hover:before:bg-gray-600">
          <Image
            src={recipe.recipe_image}
            alt={recipe.recipe_name}
            width={500}
            height={500}
            className="relative z-0 w-full cursor-pointer rounded-3xl object-cover transition-opacity duration-300 group-hover:opacity-20"
          />

          <div className="absolute top-3 right-3 z-20 rounded-full bg-trinidad-500 px-3 py-1 text-sm font-bold text-white">
            {recipe.score}% match
          </div>

          <div className="absolute bottom-4 left-4 z-20 flex flex-col items-start px-4 py-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <h3 className="text-lg font-bold text-white">
              {recipe.recipe_name}
            </h3>
            <p className="mt-1 text-sm text-gray-200">{recipe.creator_name}</p>
          </div>

          <AddToPlanCardButton recipeId={recipe.recipe_id} />
        </div>
      </Link>
    </li>
  )
}
