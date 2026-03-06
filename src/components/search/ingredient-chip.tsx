'use client'

type IngredientChipProps = {
  name: string
  onRemove: () => void
}

export function IngredientChip({ name, onRemove }: IngredientChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-trinidad-500 bg-opacity-30 px-3 py-1 text-sm text-trinidad-100 border border-trinidad-500">
      {name}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 text-trinidad-300 hover:text-white transition-colors"
        aria-label={`Remove ${name}`}
      >
        &times;
      </button>
    </span>
  )
}
