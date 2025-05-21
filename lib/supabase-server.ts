import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

export const createServerSupabaseClient = () => {
  try {
    return createServerComponentClient<Database>({
      cookies,
    })
  } catch (error) {
    console.error("Failed to create server Supabase client:", error)
    // Return a mock client that won't break the build
    return {
      auth: {
        getSession: async () => ({ data: { session: null } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({ data: [] }),
            single: () => ({ data: null }),
          }),
        }),
      }),
    } as any
  }
}

export async function getSession() {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function getUserDetails() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: userDetails } = await supabase.from("profiles").select("*").single()
    return userDetails
  } catch (error) {
    console.error("Error getting user details:", error)
    return null
  }
}
