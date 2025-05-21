"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, ListTodo, Brain } from "lucide-react"
import AuthForm from "./auth-form"
import { EnvCheck } from "./env-check"

export default function LandingPage() {
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")

  const handleShowAuth = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setShowAuthForm(true)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
            <span className="text-xl font-bold">TaskMaster</span>
          </div>
          <div className="space-x-2">
            <Button variant="ghost" onClick={() => handleShowAuth("login")}>
              Login
            </Button>
            <Button onClick={() => handleShowAuth("signup")}>Sign Up</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <EnvCheck />
        {showAuthForm ? (
          <div className="container mx-auto px-4 py-12 max-w-md">
            <AuthForm mode={authMode} onToggleMode={() => setAuthMode(authMode === "login" ? "signup" : "login")} />
          </div>
        ) : (
          <>
            <section className="bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20">
              <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">Manage Tasks Efficiently</h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                  Stay organized, boost productivity, and never miss a deadline with our powerful task management
                  platform.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button size="lg" onClick={() => handleShowAuth("signup")}>
                    Get Started for Free
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => handleShowAuth("login")}>
                    Login to Your Account
                  </Button>
                </div>
              </div>
            </section>

            <section className="py-20">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Why Task Management Matters</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="mb-4 text-emerald-500">
                      <Clock className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Save Time</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Efficiently organize your tasks and save up to 10 hours per week by eliminating time spent
                      searching for information.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="mb-4 text-emerald-500">
                      <ListTodo className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Increase Productivity</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Studies show that organized task management can increase productivity by up to 40% by reducing
                      context switching.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="mb-4 text-emerald-500">
                      <Brain className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Reduce Stress</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Clear organization of tasks reduces mental load and stress, leading to better focus and work-life
                      balance.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gray-100 dark:bg-gray-800 py-20">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-8">Ready to Get Organized?</h2>
                <Button size="lg" onClick={() => handleShowAuth("signup")}>
                  Sign Up Now
                </Button>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="font-bold">TaskMaster</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                © {new Date().getFullYear()} TaskMaster. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-400 hover:text-white">
                Terms
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                Privacy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
