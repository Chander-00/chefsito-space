import { auth } from '@/auth'
import { getAllUsers } from '@/lib/data/user.queries'
import { AdminUserList } from '@/components/admin/admin-user-list'
import { Pagination } from '@/components/pagination'

const PER_PAGE = 25

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const resolvedParams = await searchParams
  const currentPage = Number(resolvedParams?.page) || 1
  const [{ users, total }, session] = await Promise.all([
    getAllUsers(currentPage, PER_PAGE),
    auth(),
  ])
  const totalPages = Math.ceil(total / PER_PAGE)

  const serializedUsers = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    provider: user.accounts[0]?.provider ?? null,
    recipeCount: user._count.Recipe,
    createdAt: user.createdAt,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">User Management</h1>
      <AdminUserList users={serializedUsers} currentUserId={session!.user.id!} />
      <Pagination totalPages={totalPages} currentPage={currentPage} />
    </div>
  )
}
