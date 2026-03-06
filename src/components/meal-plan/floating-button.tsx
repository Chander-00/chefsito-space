'use client'

import { useState } from 'react'
import { useMealPlan } from '@/contexts/meal-plan-context'
import { ShoppingCartIcon } from '@heroicons/react/24/solid'
import { MealPlanDrawer } from './drawer'

export function MealPlanFloatingButton() {
  const { recipes } = useMealPlan()
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (recipes.length === 0) return null

  return (
    <>
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-trinidad-500 p-4 text-white shadow-lg transition-transform hover:scale-105 hover:bg-trinidad-600"
        title="View meal plan"
      >
        <ShoppingCartIcon className="h-6 w-6" />
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-trinidad-600">
          {recipes.length}
        </span>
      </button>

      <MealPlanDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  )
}
