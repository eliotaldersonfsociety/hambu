"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { MenuItem } from "./types"
import { MENU_ITEMS } from "./menu-data"

interface MenuContextType {
  menuItems: MenuItem[]
  addMenuItem: (item: Omit<MenuItem, "id">) => void
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void
  deleteMenuItem: (id: string) => void
  toggleAvailability: (id: string) => void
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])

  // Load menu from localStorage or use default
  useEffect(() => {
    const stored = localStorage.getItem("menu-items")
    if (stored) {
      setMenuItems(JSON.parse(stored))
    } else {
      setMenuItems(MENU_ITEMS)
    }
  }, [])

  // Save to localStorage whenever menu changes
  useEffect(() => {
    if (menuItems.length > 0) {
      localStorage.setItem("menu-items", JSON.stringify(menuItems))
    }
  }, [menuItems])

  const addMenuItem = (item: Omit<MenuItem, "id">) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString(),
    }
    setMenuItems((prev) => [...prev, newItem])
  }

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id))
  }

  const toggleAvailability = (id: string) => {
    setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, available: !item.available } : item)))
  }

  return (
    <MenuContext.Provider value={{ menuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability }}>
      {children}
    </MenuContext.Provider>
  )
}

export function useMenu() {
  const context = useContext(MenuContext)
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider")
  }
  return context
}
