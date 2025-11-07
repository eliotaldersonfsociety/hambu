"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  users: User[]
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  addUser: (user: Omit<User, "id"> & { password: string }) => void
  deleteUser: (userId: string) => void
  updateUser: (userId: string, updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo - these will be the initial users if none exist in localStorage
const INITIAL_USERS: (User & { password: string })[] = [
  {
    id: "1",
    name: "Carlos Mesero",
    email: "mesero@burguerclub.com",
    password: "mesero123",
    role: "waiter",
  },
  {
    id: "2",
    name: "Ana Cocina",
    email: "cocina@burguerclub.com",
    password: "cocina123",
    role: "kitchen",
  },
  {
    id: "3",
    name: "Luis Admin",
    email: "admin@burguerclub.com",
    password: "admin123",
    role: "admin",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<(User & { password: string })[]>([])

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("burguerclub_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    const storedUsers = localStorage.getItem("burguerclub_users")
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers))
    } else {
      setUsers(INITIAL_USERS)
      localStorage.setItem("burguerclub_users", JSON.stringify(INITIAL_USERS))
    }
  }, [])

  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("burguerclub_users", JSON.stringify(users))
    }
  }, [users])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const foundUser = users.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("burguerclub_user", JSON.stringify(userWithoutPassword))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("burguerclub_user")
  }

  const addUser = (newUser: Omit<User, "id"> & { password: string }) => {
    const userWithId = {
      ...newUser,
      id: `user-${Date.now()}`,
    }
    setUsers((prev) => [...prev, userWithId])
  }

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)))
  }

  const publicUsers: User[] = users.map(({ password: _, ...user }) => user)

  return (
    <AuthContext.Provider
      value={{
        user,
        users: publicUsers,
        login,
        logout,
        isAuthenticated: !!user,
        addUser,
        deleteUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
