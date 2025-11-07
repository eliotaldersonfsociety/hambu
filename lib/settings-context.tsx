"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Settings } from "./types"

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const DEFAULT_SETTINGS: Settings = {
  tipsEnabled: true,
  tipPercentages: [10, 15, 20],
  taxEnabled: true,
  taxPercentage: 16,
  bankAccounts: [
    {
      id: "1",
      bankName: "Banco Nacional",
      accountNumber: "1234-5678-9012-3456",
      accountHolder: "Food Truck SA de CV",
      accountType: "Cuenta Corriente",
    },
  ],
  numberOfTables: 10,
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  useEffect(() => {
    const stored = localStorage.getItem("app-settings")
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }
  }, [])

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem("app-settings", JSON.stringify(updated))
  }

  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider")
  }
  return context
}
