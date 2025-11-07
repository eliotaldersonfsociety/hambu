"use client"

import { useState, useEffect } from "react"
import { useOrders } from "@/lib/orders-context"
import { useNotifications } from "@/lib/notifications-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { Order, OrderType } from "@/lib/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UtensilsCrossed, Package, Truck, Phone, MapPin } from "lucide-react"

export default function KitchenDashboard() {
  return (
    <ProtectedRoute allowedRoles={["kitchen"]}>
      <KitchenDashboardContent />
    </ProtectedRoute>
  )
}

function KitchenDashboardContent() {
  const { orders, updateOrderStatus } = useOrders()
  const { addNotification } = useNotifications()
  const [selectedStatus, setSelectedStatus] = useState<"all" | Order["status"]>("all")
  const [orderTypeFilter, setOrderTypeFilter] = useState<"all" | OrderType>("all")

  useEffect(() => {
    const interval = setInterval(() => {
      window.dispatchEvent(new Event("storage"))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const filteredOrders = orders.filter((order) => {
    const statusMatch = selectedStatus === "all" || order.status === selectedStatus
    const typeMatch = orderTypeFilter === "all" || order.orderType === orderTypeFilter
    return statusMatch && typeMatch
  })

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

  const getOrderTypeInfo = (orderType: OrderType | undefined) => {
    switch (orderType) {
      case "dine-in":
        return { label: "Mesa", icon: UtensilsCrossed, color: "bg-blue-100 text-blue-700" }
      case "takeout":
        return { label: "Para Llevar", icon: Package, color: "bg-green-100 text-green-700" }
      case "delivery":
        return { label: "Domicilio", icon: Truck, color: "bg-orange-100 text-orange-700" }
      default:
        return { label: "Mesa", icon: UtensilsCrossed, color: "bg-blue-100 text-blue-700" }
    }
  }

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    const order = orders.find((o) => o.id === orderId)
    updateOrderStatus(orderId, newStatus)

    if (newStatus === "ready" && order) {
      addNotification({
        orderId: order.id,
        orderNumber: order.orderNumber,
        waiterName: order.waiterName,
        message: `Pedido #${order.orderNumber} está listo para recoger`,
      })
    }
  }

  const getNextStatus = (currentStatus: Order["status"]): Order["status"] | null => {
    switch (currentStatus) {
      case "pending":
        return "preparing"
      case "preparing":
        return "ready"
      case "ready":
        return "delivered"
      default:
        return null
    }
  }

  const getNextStatusLabel = (currentStatus: Order["status"]): string => {
    const nextStatus = getNextStatus(currentStatus)
    if (!nextStatus) return ""
    return getStatusLabel(nextStatus)
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length
  const preparingCount = orders.filter((o) => o.status === "preparing").length
  const readyCount = orders.filter((o) => o.status === "ready").length

  const dineInCount = orders.filter(
    (o) => (o.orderType === "dine-in" || !o.orderType) && o.status !== "delivered",
  ).length
  const takeoutCount = orders.filter((o) => o.orderType === "takeout" && o.status !== "delivered").length
  const deliveryCount = orders.filter((o) => o.orderType === "delivery" && o.status !== "delivered").length

  const totalTips = orders.reduce((sum, order) => sum + (order.tip || 0), 0)
  const deliveredOrders = orders.filter((o) => o.status === "delivered")
  const totalTipsDelivered = deliveredOrders.reduce((sum, order) => sum + (order.tip || 0), 0)

  return (
    <div className="min-h-screen bg-[#fafada]">
      <DashboardHeader title="Cocina" role="kitchen" />

      <div className="container mx-auto p-4 lg:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pendientes</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>En Preparación</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{preparingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Listos</CardDescription>
              <CardTitle className="text-3xl text-green-600">{readyCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-3">
              <CardDescription className="text-green-700">Propinas Totales</CardDescription>
              <CardTitle className="text-3xl text-green-600">${totalTips.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-green-600">Compartidas con todo el equipo</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-2">
            <CardHeader className="pb-3">
              <CardDescription>Por Tipo de Pedido</CardDescription>
              <div className="flex flex-wrap gap-2 sm:gap-4 mt-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <UtensilsCrossed className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  <span className="text-sm sm:text-lg font-bold text-blue-600">{dineInCount}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  <span className="text-sm sm:text-lg font-bold text-green-600">{takeoutCount}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                  <span className="text-sm sm:text-lg font-bold text-orange-600">{deliveryCount}</span>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Orders Section */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos</CardTitle>
            <CardDescription>Gestiona el estado de los pedidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label className="text-sm font-semibold mb-2 block">Tipo de Pedido</Label>
              <select
                value={orderTypeFilter}
                onChange={(e) => setOrderTypeFilter(e.target.value as any)}
                className="w-full p-2 border rounded-md bg-white sm:hidden"
              >
                <option value="all">Todos</option>
                <option value="dine-in">Mesa ({dineInCount})</option>
                <option value="takeout">Llevar ({takeoutCount})</option>
                <option value="delivery">Domicilio ({deliveryCount})</option>
              </select>
              <Tabs value={orderTypeFilter} onValueChange={(value) => setOrderTypeFilter(value as any)} className="hidden sm:block">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="dine-in" className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4" />
                    Mesa ({dineInCount})
                  </TabsTrigger>
                  <TabsTrigger value="takeout" className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Llevar ({takeoutCount})
                  </TabsTrigger>
                  <TabsTrigger value="delivery" className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Domicilio ({deliveryCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="mb-6">
              <Label className="text-sm font-semibold mb-2 block">Estado</Label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full p-2 border rounded-md bg-white sm:hidden"
              >
                <option value="all">Todos ({filteredOrders.length})</option>
                <option value="pending">Pendientes</option>
                <option value="preparing">Preparando</option>
                <option value="ready">Listos</option>
                <option value="delivered">Entregados</option>
              </select>
              <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)} className="hidden sm:block">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="all">Todos ({filteredOrders.length})</TabsTrigger>
                  <TabsTrigger value="pending">Pendientes</TabsTrigger>
                  <TabsTrigger value="preparing">Preparando</TabsTrigger>
                  <TabsTrigger value="ready">Listos</TabsTrigger>
                  <TabsTrigger value="delivered">Entregados</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="h-[400px] sm:h-[600px] pr-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">
                    No hay pedidos{" "}
                    {selectedStatus !== "all" ? getStatusLabel(selectedStatus as Order["status"]).toLowerCase() : ""}
                  </p>
                  <p className="text-sm mt-2">Los nuevos pedidos aparecerán aquí automáticamente</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredOrders.map((order) => {
                    const orderTypeInfo = getOrderTypeInfo(order.orderType)
                    const OrderTypeIcon = orderTypeInfo.icon

                    return (
                      <Card key={order.id} className="overflow-hidden border-2">
                        <CardHeader className="pb-3 bg-[#12372b] text-[#fafada] px-4 pt-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-2xl font-bold">Pedido #{order.orderNumber}</CardTitle>
                              <CardDescription className="mt-1 text-[#fafada]">{order.waiterName}</CardDescription>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              <Badge className={`${getStatusColor(order.status)} text-white`}>
                                {getStatusLabel(order.status)}
                              </Badge>
                              <Badge className={orderTypeInfo.color} variant="secondary">
                                <OrderTypeIcon className="w-3 h-3 mr-1" />
                                {orderTypeInfo.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-gray-100 mt-2">
                            {new Date(order.createdAt).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>

                          {order.orderType === "dine-in" && order.tableNumber && (
                            <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
                              <p className="text-sm font-semibold text-blue-900">
                                <UtensilsCrossed className="w-4 h-4 inline mr-1" />
                                Mesa: {order.tableNumber}
                              </p>
                            </div>
                          )}

                          {order.orderType === "delivery" && (
                            <div className="mt-2 bg-orange-50 border border-orange-200 rounded p-2 space-y-1">
                              <p className="text-sm font-semibold text-orange-900">
                                <Truck className="w-4 h-4 inline mr-1" />
                                DOMICILIO
                              </p>
                              {order.phoneNumber && (
                                <p className="text-xs text-orange-800">
                                  <Phone className="w-3 h-3 inline mr-1" />
                                  {order.phoneNumber}
                                </p>
                              )}
                              {order.deliveryAddress && (
                                <p className="text-xs text-orange-800">
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  {order.deliveryAddress}
                                </p>
                              )}
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                                <div className="flex items-start justify-between mb-1">
                                  <span className="font-medium text-sm">
                                    {item.quantity}x {item.menuItem.name}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    ${(item.menuItem.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                                {item.notes && (
                                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-1">
                                    <p className="text-xs text-yellow-800">
                                      <span className="font-semibold">Nota:</span> {item.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-3 border-t flex items-center justify-between">
                            <span className="font-semibold">Total:</span>
                            <span className="text-lg font-bold text-orange-600">${order.total.toFixed(2)}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50 flex gap-2">
                          {order.status !== "delivered" && getNextStatus(order.status) && (
                            <Button
                              onClick={() => handleStatusChange(order.id, getNextStatus(order.status)!)}
                              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                              size="sm"
                            >
                              Marcar como {getNextStatusLabel(order.status)}
                            </Button>
                          )}
                          {order.status === "delivered" && (
                            <div className="flex-1 text-center text-sm text-gray-500 py-2">Pedido completado</div>
                          )}
                        </CardFooter>
                      </Card>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
