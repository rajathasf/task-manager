import { redirect } from "next/navigation"
import { getSession } from "@/lib/supabase-server"
import LandingPage from "@/components/landing-page"

export default async function Home() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return <LandingPage />
}
