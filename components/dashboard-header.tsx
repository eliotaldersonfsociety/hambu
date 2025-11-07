"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notifications-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"

interface DashboardHeaderProps {
  title: string
  role: "waiter" | "kitchen" | "admin"
  onNotificationsClick?: () => void
}

const roleLabels = {
  waiter: "Mesero",
  kitchen: "Cocina",
  admin: "Administrador",
}

const roleColors = {
  waiter: "bg-blue-500",
  kitchen: "bg-green-500",
  admin: "bg-purple-500",
}

export function DashboardHeader({ title, role, onNotificationsClick }: DashboardHeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { unreadCount } = useNotifications()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="bg-[#12372b] border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img width="36" height="36" src="https://img.icons8.com/3d-fluency/94/hamburger.png" alt="hamburger" className="sm:w-12 sm:h-12" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-[#fafada]" style={{ fontFamily: "var(--font-fascinate)" }}>Burguer Club</h1>
                <p className="text-sm text-[#fafada]">{title}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {role === "waiter" && onNotificationsClick && (
              <Button variant="outline" size="sm" onClick={onNotificationsClick} className="relative bg-transparent">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            )}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-[#fafada]">{user?.name}</p>
              <Badge className={`${roleColors[role]} text-white text-xs`}>{roleLabels[role]}</Badge>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm" className="bg-[#fafada]">
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
