import { RecipeIngredient } from '@/types/recipes'

type UnitGroup = 'weight' | 'volume' | 'count' | (string & {})

type BaseConversion = { value: number; group: UnitGroup }

type HumanizedQuantity = { quantity: number; unit: string }

const UNIT_MAP: Record<string, { factor: number; group: UnitGroup }> = {
  g:    { factor: 1,     group: 'weight' },
  kg:   { factor: 1000,  group: 'weight' },
  oz:   { factor: 28.35, group: 'weight' },
  ml:   { factor: 1,     group: 'volume' },
  l:    { factor: 1000,  group: 'volume' },
  tsp:  { factor: 5,     group: 'volume' },
  tbsp: { factor: 15,    group: 'volume' },
  cup:  { factor: 240,   group: 'volume' },
  pz:   { factor: 1,     group: 'count' },
  pcs:  { factor: 1,     group: 'count' },
}

export function convertToBase(quantity: number, unit: string): BaseConversion {
  const entry = UNIT_MAP[unit.toLowerCase()]
  if (!entry) return { value: quantity, group: unit.toLowerCase() }
  return { value: parseFloat((quantity * entry.factor).toFixed(4)), group: entry.group }
}

export function humanize(baseValue: number, group: UnitGroup): HumanizedQuantity {
  if (group === 'weight') {
    if (baseValue >= 1000) return { quantity: parseFloat((baseValue / 1000).toFixed(2)), unit: 'kg' }
    return { quantity: parseFloat(baseValue.toFixed(2)), unit: 'g' }
  }
  if (group === 'volume') {
    if (baseValue >= 1000) return { quantity: parseFloat((baseValue / 1000).toFixed(2)), unit: 'L' }
    return { quantity: parseFloat(baseValue.toFixed(2)), unit: 'ml' }
  }
  if (group === 'count') return { quantity: baseValue, unit: 'pz' }
  return { quantity: baseValue, unit: group }
}

export type AggregatedIngredient = {
  name: string
  quantity: number
  unit: string
}

export function aggregateIngredients(
  ingredients: RecipeIngredient[]
): AggregatedIngredient[] {
  if (ingredients.length === 0) return []

  // Group by lowercase name + unit group
  const groups = new Map<string, { name: string; baseValue: number; group: UnitGroup }>()

  for (const ing of ingredients) {
    const { value, group } = convertToBase(ing.quantity, ing.unit)
    const key = `${ing.name.toLowerCase().trim()}::${group}`

    const existing = groups.get(key)
    if (existing) {
      existing.baseValue += value
      existing.name = ing.name.trim()
    } else {
      groups.set(key, { name: ing.name.trim(), baseValue: value, group })
    }
  }

  const result: AggregatedIngredient[] = []
  for (const entry of Array.from(groups.values())) {
    const { quantity, unit } = humanize(entry.baseValue, entry.group)
    result.push({ name: entry.name, quantity, unit })
  }

  return result
}
