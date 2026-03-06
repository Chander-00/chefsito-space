import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white">Admin</h1>
        </div>
        <nav className="flex-1 px-3">
          <Link
            href="/admin"
            className="block px-3 py-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/recipes"
            className="block px-3 py-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            Recipes
          </Link>
          <Link
            href="/admin/users"
            className="block px-3 py-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            Users
          </Link>
        </nav>
        <div className="p-3 border-t border-gray-800">
          <Link
            href="/"
            className="block px-3 py-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            ← Back to site
          </Link>
        </div>
      </aside>
      <main className="flex-1 bg-gray-950 p-8">{children}</main>
    </div>
  )
}
