import { getSession } from "@/lib/supabase-server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import TaskManager from "@/components/task-manager"

export default async function DashboardPage() {
  const session = await getSession()
  const supabase = createServerSupabaseClient()

  let tasks = []

  try {
    // Fetch tasks for the current user
    if (session?.user.id) {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      tasks = data || []
    }
  } catch (error) {
    console.error("Error fetching tasks:", error)
  }

  return (
    <div className="p-6">
      <TaskManager initialTasks={tasks} userId={session?.user.id || ""} />
    </div>
  )
}
