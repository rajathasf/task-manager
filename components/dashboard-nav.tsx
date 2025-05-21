"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { CheckCircle, ListTodo, FileText, LogOut, Menu, X } from "lucide-react"

export default function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { supabase } = useSupabase()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push("/")
  }

  const navItems = [
    { href: "/dashboard", label: "Tasks", icon: <ListTodo className="h-5 w-5" /> },
    { href: "/dashboard/notes", label: "Notes", icon: <FileText className="h-5 w-5" /> },
  ]

  return (
    <>
      <div className="hidden md:flex flex-col w-64 bg-gray-50 dark:bg-gray-900 border-r">
        <div className="p-4 border-b">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
            <span className="font-bold text-lg">TaskMaster</span>
          </Link>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 ${
                    pathname === item.href ? "bg-gray-200 dark:bg-gray-800" : ""
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden flex items-center justify-between p-4 border-b w-full">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <CheckCircle className="h-6 w-6 text-emerald-500" />
          <span className="font-bold text-lg">TaskMaster</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-gray-950 pt-16">
          <nav className="p-4">
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-2 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      pathname === item.href ? "bg-gray-100 dark:bg-gray-800" : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="text-lg">{item.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Button variant="ghost" className="w-full justify-start p-3 text-lg" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign Out
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  )
}
