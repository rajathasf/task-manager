import { getSession } from "@/lib/supabase-server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import NotePad from "@/components/notepad"

export default async function NotesPage() {
  const session = await getSession()
  const supabase = createServerSupabaseClient()

  let notes = []

  try {
    // Fetch notes for the current user
    if (session?.user.id) {
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      notes = data || []
    }
  } catch (error) {
    console.error("Error fetching notes:", error)
  }

  return (
    <div className="p-6">
      <NotePad initialNotes={notes} userId={session?.user.id || ""} />
    </div>
  )
}
