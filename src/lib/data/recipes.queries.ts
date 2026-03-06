import { auth } from "@/auth";
import { Recipe, RecipeIngredient as RecipeIngredientType, RecipePreview, RecipeInput } from "@/types/recipes";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import slugify from "slugify";
import { generateRandomString } from "../utils/strings";

type PrismaRecipeWithRelations = {
  id: string
  title: string
  slug: string
  description: string
  image: string
  instructions: unknown
  userId: string
  country: { name: string }
  user: { name: string | null }
  recipeIngredients: {
    weight: number
    quantity: number
    unit: string
    ingredient: { name: string }
  }[]
}

function toRecipe(r: PrismaRecipeWithRelations): Recipe {
  return {
    recipe_id: r.id,
    recipe_name: r.title,
    recipe_slug: r.slug,
    recipe_instructions: r.instructions as Recipe['recipe_instructions'],
    recipe_user_id: r.userId,
    recipe_country: r.country.name,
    recipe_description: r.description,
    recipe_image: r.image,
    creator_name: r.user.name ?? 'Unknown',
    recipe_ingredients: r.recipeIngredients.map((ri) => ({
      name: ri.ingredient.name,
      unit: ri.unit,
      weight: ri.weight,
      quantity: ri.quantity,
    })),
  }
}

const recipeInclude = {
  country: true,
  user: { select: { name: true } },
  recipeIngredients: {
    include: { ingredient: true },
  },
} as const

export async function getRecipesPreviewFromDB(
  query?: string,
  page = 1,
  perPage = 25
): Promise<{ recipes: RecipePreview[]; total: number }> {
  const where = {
    deletedAt: null as null,
    ...(query ? { title: { contains: query, mode: 'insensitive' as const } } : {}),
  }

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      include: {
        country: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.recipe.count({ where }),
  ])

  return {
    recipes: recipes.map((r) => ({
      recipe_id: r.id,
      recipe_name: r.title,
      recipe_slug: r.slug,
      recipe_country: r.country.name,
      recipe_image: r.image,
      creator_name: r.user.name ?? 'Unknown',
    })),
    total,
  }
}

export async function getRecipeBySlugFromDB(slug: string): Promise<Recipe | undefined> {
  const r = await prisma.recipe.findFirst({
    where: { slug, deletedAt: null },
    include: recipeInclude,
  })
  if (!r) return undefined
  return toRecipe(r as PrismaRecipeWithRelations)
}

export async function getRecipeByIdFromDB(id: string): Promise<Recipe | null> {
  const r = await prisma.recipe.findFirst({
    where: { id, deletedAt: null },
    include: recipeInclude,
  })
  if (!r) return null
  return toRecipe(r as PrismaRecipeWithRelations)
}

export async function searchIngredientsFromDB(searchTerm: string): Promise<string[]> {
  const ingredients = await prisma.ingredient.findMany({
    where: {
      name: { contains: searchTerm, mode: 'insensitive' },
    },
    select: { name: true },
    take: 20,
  })
  return ingredients.map((i) => i.name)
}

export async function getRecipesForScoringFromDB(): Promise<Recipe[]> {
  const recipes = await prisma.recipe.findMany({
    where: { deletedAt: null },
    include: recipeInclude,
  })
  return recipes.map((r) => toRecipe(r as PrismaRecipeWithRelations))
}

export async function getRandomRecipeSlugFromDB(): Promise<string | null> {
  const count = await prisma.recipe.count({ where: { deletedAt: null } })
  if (count === 0) return null
  const skip = Math.floor(Math.random() * count)
  const recipe = await prisma.recipe.findFirst({
    where: { deletedAt: null },
    select: { slug: true },
    skip,
  })
  return recipe?.slug ?? null
}

export async function getAdminStats() {
  const [totalRecipes, totalUsers, totalFavorites] = await Promise.all([
    prisma.recipe.count({ where: { deletedAt: null } }),
    prisma.user.count(),
    prisma.favorite.count(),
  ])
  return { totalRecipes, totalUsers, totalFavorites }
}

export async function getMostFavoritedRecipes(limit = 5) {
  const recipes = await prisma.recipe.findMany({
    where: { deletedAt: null },
    include: {
      _count: { select: { favorites: true } },
      country: true,
      user: { select: { name: true } },
    },
    orderBy: { favorites: { _count: 'desc' } },
    take: limit,
  })
  return recipes.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    image: r.image,
    creator: r.user.name ?? 'Unknown',
    country: r.country.name,
    favoriteCount: r._count.favorites,
  }))
}

export async function getRecentRecipes(limit = 10) {
  const recipes = await prisma.recipe.findMany({
    where: { deletedAt: null },
    include: {
      country: true,
      user: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return recipes.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    image: r.image,
    creator: r.user.name ?? 'Unknown',
    country: r.country.name,
    createdAt: r.createdAt,
  }))
}

export async function getAdminRecipes(
  query?: string,
  includeDeleted = false,
  page = 1,
  perPage = 25
) {
  const where = {
    ...(!includeDeleted ? { deletedAt: null as null } : {}),
    ...(query ? { title: { contains: query, mode: 'insensitive' as const } } : {}),
  }

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      include: {
        country: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.recipe.count({ where }),
  ])

  return {
    recipes: recipes.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      image: r.image,
      creator: r.user.name ?? 'Unknown',
      country: r.country.name,
      createdAt: r.createdAt,
      deletedAt: r.deletedAt,
    })),
    total,
  }
}

export async function softDeleteRecipe(id: string) {
  await prisma.recipe.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

export async function restoreRecipe(id: string) {
  await prisma.recipe.update({
    where: { id },
    data: { deletedAt: null },
  })
}

export async function updateRecipe(
  id: string,
  data: {
    title: string
    description: string
    country: string
    ingredients: RecipeIngredientType[]
    instructions: Recipe['recipe_instructions']
    image?: string
  }
) {
  await prisma.$transaction(async (tx) => {
    const countryRecord = await tx.country.findUnique({
      where: { name: data.country },
    })

    if (!countryRecord) {
      throw new Error('Something went wrong retrieving the country')
    }

    await tx.recipe.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        countryId: countryRecord.id,
        instructions: data.instructions,
        ...(data.image ? { image: data.image } : {}),
      },
    })

    await tx.recipeIngredient.deleteMany({ where: { recipeId: id } })

    await Promise.all(
      data.ingredients.map(async (ing) => {
        const trimmedName = ing.name.trim()

        let ingredientRecord = await tx.ingredient.findFirst({
          where: { name: { equals: trimmedName, mode: 'insensitive' } },
          select: { id: true },
        })

        if (!ingredientRecord) {
          ingredientRecord = await tx.ingredient.create({
            data: { name: trimmedName },
            select: { id: true },
          })
        }

        return tx.recipeIngredient.create({
          data: {
            recipeId: id,
            ingredientId: ingredientRecord.id,
            weight: ing.weight || 1,
            quantity: ing.quantity,
            unit: ing.unit,
          },
        })
      })
    )
  })
}

export async function toggleFavorite(userId: string, recipeId: string): Promise<boolean> {
  const existing = await prisma.favorite.findUnique({
    where: { userId_recipeId: { userId, recipeId } },
  })

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    return false
  }

  await prisma.favorite.create({ data: { userId, recipeId } })
  return true
}

export async function getUserFavoriteIds(userId: string): Promise<Set<string>> {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { recipeId: true },
  })
  return new Set(favorites.map((f) => f.recipeId))
}

export async function isRecipeFavorited(userId: string, recipeId: string): Promise<boolean> {
  const fav = await prisma.favorite.findUnique({
    where: { userId_recipeId: { userId, recipeId } },
    select: { id: true },
  })
  return !!fav
}

export async function getUserFavoriteRecipes(
  userId: string,
  page = 1,
  perPage = 25
): Promise<{ recipes: RecipePreview[]; total: number }> {
  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId, recipe: { deletedAt: null } },
      include: {
        recipe: {
          include: {
            country: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.favorite.count({ where: { userId, recipe: { deletedAt: null } } }),
  ])

  return {
    recipes: favorites.map((f) => ({
      recipe_id: f.recipe.id,
      recipe_name: f.recipe.title,
      recipe_slug: f.recipe.slug,
      recipe_country: f.recipe.country.name,
      recipe_image: f.recipe.image,
      creator_name: f.recipe.user.name ?? 'Unknown',
    })),
    total,
  }
}

export const createRecipe = async (preRecipe: RecipeInput) => {
  const session = await auth()
  if (!session?.user.id) {
    throw new Error('Unauthorized');
  }
  let imageUrl = ''
  
  if (!preRecipe.imageInput) return
  try {
    imageUrl = await uploadImage(preRecipe.imageInput)
  } catch (error) {
    console.error(error)
    throw new Error("Something went wrong uploading the image")
  }
  
  const randomPrefix = generateRandomString(10)
  const sluggedText = slugify(preRecipe.name, {lower: true, trim: true})
  const slug = `${sluggedText}-${randomPrefix}`

  await prisma.$transaction(async (tx) => {
    
    const countryRecord = await tx.country.findUnique({
      where: {
        name: preRecipe.country
      }
    })

    if (!countryRecord) {
      throw new Error("Something went wrong retrieving the country")
    }

    const recipe = await tx.recipe.create({
      data: {
        title: preRecipe.name,
        description: preRecipe.description,
        image: imageUrl,
        slug,
        instructions: preRecipe.instructions,
        userId: session?.user.id as string,
        countryId: countryRecord.id,
      }
    })

    await Promise.all(
      preRecipe.ingredients.map(async(ing) => {
        const trimmedName = ing.name.trim()

        let ingredientRecord = await tx.ingredient.findFirst({
          where: { name: { equals: trimmedName, mode: 'insensitive' } },
          select: { id: true },
        })

        if (!ingredientRecord) {
          ingredientRecord = await tx.ingredient.create({
            data: { name: trimmedName },
            select: { id: true },
          })
        }

        return await tx.recipeIngredient.create({
          data: {
            recipeId: recipe.id,
            ingredientId: ingredientRecord.id,
            weight: ing.weight || 1,
            quantity: ing.quantity,
            unit: ing.unit,
          }
        })
      })
    ).catch(e => {
      console.error("Something went wrong creating the recipe-ingredients", e)
      throw new Error("Something went wrong creating the recipe")
    })

  })

  return slug
}
