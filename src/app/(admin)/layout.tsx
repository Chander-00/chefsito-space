import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminRouteGroup({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") redirect("/")
  return <>{children}</>
}
