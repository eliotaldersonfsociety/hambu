"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { Notification } from "./types"

interface NotificationsContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  unreadCount: number
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const isUpdatingFromStorage = useRef(false)

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("notifications")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        isUpdatingFromStorage.current = true
        setNotifications(
          parsed.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          })),
        )
      } catch (error) {
        console.error("Error loading notifications:", error)
      }
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (!isUpdatingFromStorage.current) {
      localStorage.setItem("notifications", JSON.stringify(notifications))
    } else {
      // Reset flag after state update completes
      isUpdatingFromStorage.current = false
    }
  }, [notifications])

  // Listen for storage events to sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "notifications" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          isUpdatingFromStorage.current = true
          setNotifications(
            parsed.map((n: any) => ({
              ...n,
              createdAt: new Date(n.createdAt),
            })),
          )
        } catch (error) {
          console.error("Error syncing notifications:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      createdAt: new Date(),
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        unreadCount,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
