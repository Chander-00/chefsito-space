'use client'

import { MealPlanProvider } from '@/contexts/meal-plan-context'
import { MealPlanFloatingButton } from '@/components/meal-plan/floating-button'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MealPlanProvider>
      {children}
      <MealPlanFloatingButton />
    </MealPlanProvider>
  )
}
