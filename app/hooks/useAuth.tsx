"use client"

import { useRouter } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (result?.ok) {
      router.push("/") // Redireccionar al home
      return { success: true }
    }

    return { success: false, error: result?.error || "Error desconocido" }
  }

  const logout = () => {
    signOut({ callbackUrl: "/login" })
  }

  return {
    user: session?.user || null,
    loading: status === "loading",
    login,
    logout,
  }
}
