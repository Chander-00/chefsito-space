import { auth } from '@/auth'
import { getAllUsers } from '@/lib/data/user.queries'
import { AdminUserList } from '@/components/admin/admin-user-list'

export default async function AdminUsersPage() {
  const [users, session] = await Promise.all([getAllUsers(), auth()])

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
    </div>
  )
}
