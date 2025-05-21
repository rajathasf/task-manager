import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/supabase-server"
import DashboardNav from "@/components/dashboard-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <div className="flex h-screen">
      <DashboardNav />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
