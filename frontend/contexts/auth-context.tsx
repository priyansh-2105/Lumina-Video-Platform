"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { UserRole, AuthState } from "@/types"
import { authService } from "@/services/api"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function decodeJwtPayload(token: string): unknown {
  const parts = token.split(".")
  if (parts.length < 2) throw new Error("Invalid token")

  const base64Url = parts[1]
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
      .join(""),
  )
  return JSON.parse(json)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("lumina_user")
    const storedToken = localStorage.getItem("lumina_token")

    // If user exists but token doesn't, treat as logged out.
    if (storedUser && !storedToken) {
      localStorage.removeItem("lumina_user")
      setState({ user: null, isAuthenticated: false, isLoading: false })
      return
    }

    // Restore from token first (authoritative), fallback to stored user.
    if (storedToken) {
      try {
        const payload = decodeJwtPayload(storedToken)
        setState({ user: payload as any, isAuthenticated: true, isLoading: false })
        return
      } catch {
        localStorage.removeItem("lumina_token")
        localStorage.removeItem("lumina_user")
        setState({ user: null, isAuthenticated: false, isLoading: false })
        router.replace("/login")
        return
      }
    }

    if (storedUser) {
      try {
        setState({ user: JSON.parse(storedUser), isAuthenticated: false, isLoading: false })
      } catch {
        localStorage.removeItem("lumina_user")
        setState({ user: null, isAuthenticated: false, isLoading: false })
      }
      return
    }

    setState((prev) => ({ ...prev, isLoading: false }))
  }, [])

  useEffect(() => {
    const handler = () => {
      localStorage.removeItem("lumina_user")
      localStorage.removeItem("lumina_token")
      setState({ user: null, isAuthenticated: false, isLoading: false })
      router.replace("/login")
    }

    window.addEventListener("lumina:unauthorized", handler)
    return () => {
      window.removeEventListener("lumina:unauthorized", handler)
    }
  }, [router])

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await authService.login(email, password)
    localStorage.setItem("lumina_user", JSON.stringify(user))
    localStorage.setItem("lumina_token", token)
    setState({ user, isAuthenticated: true, isLoading: false })
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    const { token, user } = await authService.register(name, email, password, role)
    localStorage.setItem("lumina_user", JSON.stringify(user))
    localStorage.setItem("lumina_token", token)
    setState({ user, isAuthenticated: true, isLoading: false })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("lumina_user")
    localStorage.removeItem("lumina_token")
    setState({ user: null, isAuthenticated: false, isLoading: false })
  }, [])

  return <AuthContext.Provider value={{ ...state, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
