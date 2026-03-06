import { Metadata } from 'next'
import { SearchPageClient } from '@/components/search/search-page-client'

export const metadata: Metadata = {
  title: 'Search by Ingredients - Chefsito Space',
}

export default function SearchByIngredientsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-24 pb-12">
      <h1 className="mb-2 text-3xl font-bold text-white">
        What can you cook?
      </h1>
      <p className="mb-8 text-gray-400">
        Add the ingredients you have and we&apos;ll find recipes you can make.
      </p>
      <SearchPageClient />
    </main>
  )
}
