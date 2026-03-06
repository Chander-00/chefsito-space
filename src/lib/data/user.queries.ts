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

export async function getAllUsers() {
  return prisma.user.findMany({
    include: {
      accounts: { select: { provider: true } },
      _count: { select: { Recipe: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateUserRole(id: string, role: 'ADMIN' | 'USER') {
  await prisma.user.update({ where: { id }, data: { role } })
}