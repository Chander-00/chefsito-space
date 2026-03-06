'use client'

import { useTransition } from 'react'
import { promoteUserAction, demoteUserAction } from '@/actions/admin'

type AdminUser = {
  id: string
  name: string | null
  email: string | null
  role: 'ADMIN' | 'USER'
  provider: string | null
  recipeCount: number
  createdAt: Date
}

export function AdminUserList({
  users,
  currentUserId,
}: {
  users: AdminUser[]
  currentUserId: string
}) {
  const [isPending, startTransition] = useTransition()

  const handlePromote = (id: string) => {
    startTransition(() => promoteUserAction(id))
  }

  const handleDemote = (id: string) => {
    startTransition(() => demoteUserAction(id))
  }

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-4 py-3 text-white">Name</th>
            <th className="px-4 py-3 text-white">Email</th>
            <th className="px-4 py-3 text-white">Provider</th>
            <th className="px-4 py-3 text-white">Role</th>
            <th className="px-4 py-3 text-white">Recipes</th>
            <th className="px-4 py-3 text-white">Joined</th>
            <th className="px-4 py-3 text-white">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-300">
          {users.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                No users found.
              </td>
            </tr>
          )}
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-800 last:border-0">
              <td className="px-4 py-3">{user.name ?? '—'}</td>
              <td className="px-4 py-3">{user.email ?? '—'}</td>
              <td className="px-4 py-3 capitalize">{user.provider ?? '—'}</td>
              <td className="px-4 py-3">
                {user.role === 'ADMIN' ? (
                  <span className="inline-flex items-center rounded-full bg-trinidad-500/20 px-2.5 py-0.5 text-xs font-medium text-trinidad-400">
                    ADMIN
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                    USER
                  </span>
                )}
              </td>
              <td className="px-4 py-3">{user.recipeCount}</td>
              <td className="px-4 py-3">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                {user.id === currentUserId ? (
                  <span className="text-sm text-gray-500">You</span>
                ) : user.role === 'USER' ? (
                  <button
                    onClick={() => handlePromote(user.id)}
                    disabled={isPending}
                    className="text-trinidad-500 hover:text-trinidad-400 text-sm disabled:opacity-50"
                  >
                    Promote
                  </button>
                ) : (
                  <button
                    onClick={() => handleDemote(user.id)}
                    disabled={isPending}
                    className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                  >
                    Demote
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
