import {prisma} from '@/lib/prisma'
import { Prisma } from '@prisma/client'


export async function getUserByEmail({ email }: { email: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    })

    return user
  } catch(e) {
    console.error(e)
    return null
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id }})

    return user
  } catch(e) {
    console.error(e)
    return null
  }
}

export async function createUser(data: Prisma.UserCreateInput) {
  const user = await prisma.user.create({
    data,
  });
  return user;
}

export const verifyEmail = async (id: string, email: string) => {
  await prisma.user.update({
    where: { id },
    data: {
      emailVerified: new Date(),
      email
    }
  })
}

export const updateUserPassword = async (id: string, password: string ) => {
  await prisma.user.update({
    where: { id },
    data: { password }
  })
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      _count: { select: { Recipe: true, Favorite: true } },
    },
  })
  return user
}

export async function getUserRecipes(userId: string, page = 1, perPage = 25) {
  const where = { userId, deletedAt: null as null }

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

export async function getAllUsers(page = 1, perPage = 25) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      include: {
        accounts: { select: { provider: true } },
        _count: { select: { Recipe: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.user.count(),
  ])
  return { users, total }
}

export async function updateUserRole(id: string, role: 'ADMIN' | 'USER') {
  await prisma.user.update({ where: { id }, data: { role } })
}