"use client"

import { useMemo, useState } from "react"
import { useOrders as useOrdersContext } from "@/lib/orders-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Order } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { MenuManagement } from "@/components/menu-management"
import { StaffManagement } from "@/components/staff-management"
import { SettingsManagement } from "@/components/settings-management"
import { PaymentsManagement } from "@/components/payments-management"
import { BarChart3, UtensilsCrossed, Users, Settings, ImageIcon, Wallet, DollarSign } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useOrders } from "@/lib/orders-context"

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}

function AdminDashboardContent() {
  const { orders, markOrderAsPaid } = useOrdersContext()
  const [activeTab, setActiveTab] = useState<"stats" | "menu" | "staff" | "settings" | "payments">("payments")
  const [selectedPaymentProof, setSelectedPaymentProof] = useState<string | null>(null)

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const completedOrders = orders.filter((o) => o.status === "delivered")
    const completedRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0)
    const pendingOrders = orders.filter((o) => o.status === "pending").length
    const preparingOrders = orders.filter((o) => o.status === "preparing").length
    const readyOrders = orders.filter((o) => o.status === "ready").length

    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

    const itemsSold = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
    }, 0)

    const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {}
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemCounts[item.menuItem.id]) {
          itemCounts[item.menuItem.id] = {
            name: item.menuItem.name,
            count: 0,
            revenue: 0,
          }
        }
        itemCounts[item.menuItem.id].count += item.quantity
        itemCounts[item.menuItem.id].revenue += item.menuItem.price * item.quantity
      })
    })

    const topItems = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const ordersByStatus = [
      { name: "Pendientes", value: pendingOrders, color: "#eab308" },
      { name: "Preparando", value: preparingOrders, color: "#3b82f6" },
      { name: "Listos", value: readyOrders, color: "#22c55e" },
      { name: "Entregados", value: completedOrders.length, color: "#6b7280" },
    ].filter((item) => item.value > 0)

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split("T")[0]
    })

    const revenueByDay = last7Days.map((date) => {
      const dayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt).toISOString().split("T")[0]
        return orderDate === date
      })
      const revenue = dayOrders.reduce((sum, order) => sum + order.total, 0)
      return {
        date: new Date(date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }),
        revenue: Number.parseFloat(revenue.toFixed(2)),
        orders: dayOrders.length,
      }
    })

    return {
      totalRevenue,
      completedRevenue,
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      pendingOrders,
      preparingOrders,
      readyOrders,
      avgOrderValue,
      itemsSold,
      topItems,
      ordersByStatus,
      revenueByDay,
    }
  }, [orders])

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "preparing":
        return "bg-blue-500"
      case "ready":
        return "bg-green-500"
      case "delivered":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "preparing":
        return "En Preparación"
      case "ready":
        return "Listo"
      case "delivered":
        return "Entregado"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Panel de Administración" role="admin" />

      <div className="container mx-auto p-4 lg:p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            variant={activeTab === "stats" ? "default" : "outline"}
            onClick={() => setActiveTab("stats")}
            className={activeTab === "stats" ? "bg-gradient-to-r from-orange-500 to-red-500" : ""}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Estadísticas
          </Button>
          <Button
            variant={activeTab === "payments" ? "default" : "outline"}
            onClick={() => setActiveTab("payments")}
            className={activeTab === "payments" ? "bg-gradient-to-r from-orange-500 to-red-500" : ""}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Pagos
          </Button>
          <Button
            variant={activeTab === "menu" ? "default" : "outline"}
            onClick={() => setActiveTab("menu")}
            className={activeTab === "menu" ? "bg-gradient-to-r from-orange-500 to-red-500" : ""}
          >
            <UtensilsCrossed className="w-4 h-4 mr-2" />
            Gestión de Menú
          </Button>
          <Button
            variant={activeTab === "staff" ? "default" : "outline"}
            onClick={() => setActiveTab("staff")}
            className={activeTab === "staff" ? "bg-gradient-to-r from-orange-500 to-red-500" : ""}
          >
            <Users className="w-4 h-4 mr-2" />
            Gestión de Personal
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "outline"}
            onClick={() => setActiveTab("settings")}
            className={activeTab === "settings" ? "bg-gradient-to-r from-orange-500 to-red-500" : ""}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
        </div>

        {activeTab === "payments" ? (
          <PaymentsManagement />
        ) : activeTab === "settings" ? (
          <SettingsManagement />
        ) : activeTab === "staff" ? (
          <StaffManagement />
        ) : activeTab === "menu" ? (
          <MenuManagement />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Ventas Totales</CardDescription>
                  <CardTitle className="text-3xl text-green-600">${stats.totalRevenue.toFixed(2)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">${stats.completedRevenue.toFixed(2)} completadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total de Pedidos</CardDescription>
                  <CardTitle className="text-3xl text-blue-600">{stats.totalOrders}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{stats.completedOrders} completados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Ticket Promedio</CardDescription>
                  <CardTitle className="text-3xl text-orange-600">${stats.avgOrderValue.toFixed(2)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Por pedido</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Items Vendidos</CardDescription>
                  <CardTitle className="text-3xl text-purple-600">{stats.itemsSold}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Total de productos</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Día</CardTitle>
                  <CardDescription>Últimos 7 días</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.revenueByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} labelStyle={{ color: "#000" }} />
                      <Bar dataKey="revenue" fill="#f97316" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pedidos por Estado</CardTitle>
                  <CardDescription>Distribución actual</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.ordersByStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.ordersByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stats.ordersByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">No hay pedidos aún</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Productos Más Vendidos</CardTitle>
                  <CardDescription>Top 5 items</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.topItems.length > 0 ? (
                    <div className="space-y-4">
                      {stats.topItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">{item.count} vendidos</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">${item.revenue.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No hay datos de ventas aún</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pedidos Recientes</CardTitle>
                  <CardDescription>Últimos 10 pedidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    {orders.length > 0 ? (
                      <div className="space-y-3">
                        {orders.slice(0, 10).map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">Pedido #{order.orderNumber}</span>
                                <Badge className={`${getStatusColor(order.status)} text-white text-xs`}>
                                  {getStatusLabel(order.status)}
                                </Badge>
                                {order.orderSource === "web" && order.paymentProof && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedPaymentProof(order.paymentProof || null)}
                                    className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <ImageIcon className="w-3 h-3 mr-1" />
                                    Ver Comprobante
                                  </Button>
                                )}
                                {!order.paid && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markOrderAsPaid(order.id)}
                                    className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    Marcar Pagado
                                  </Button>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {order.waiterName} • {order.items.length} items
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleString("es-ES", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-orange-600">${order.total.toFixed(2)}</p>
                              {!order.paid && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => markOrderAsPaid(order.id)}
                                  className="mt-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Marcar Pagado
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">No hay pedidos aún</div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <Dialog open={!!selectedPaymentProof} onOpenChange={() => setSelectedPaymentProof(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comprobante de Pago</DialogTitle>
            <DialogDescription>Imagen del comprobante subido por el cliente</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {selectedPaymentProof && (
              <img
                src={selectedPaymentProof || "/placeholder.svg"}
                alt="Comprobante de pago"
                className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
