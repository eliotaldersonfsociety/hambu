"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { useOrders } from "@/lib/orders-context"
import { useMenu } from "@/lib/menu-context"
import { useSettings } from "@/lib/settings-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { OrderItem, MenuItem, Order } from "@/lib/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ClipboardList, DollarSign, CreditCard, CheckCircle2 } from "lucide-react"

export default function WaiterDashboard() {
  return (
    <ProtectedRoute allowedRoles={["waiter"]}>
      <WaiterDashboardContent />
    </ProtectedRoute>
  )
}

function WaiterDashboardContent() {
  const { user } = useAuth()
  const { addOrder, orders, markOrderAsPaid } = useOrders()
  const { menuItems } = useMenu()
  const { settings } = useSettings()
  const [cart, setCart] = useState<OrderItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [view, setView] = useState<"order" | "history" | "payments">("order")
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>("")

  const categories = {
    all: "Todo",
    main: "Principales",
    side: "Acompañamientos",
    drink: "Bebidas",
    dessert: "Postres",
  }

  const filteredItems =
    selectedCategory === "all"
      ? menuItems.filter((item) => item.available)
      : menuItems.filter((item) => item.category === selectedCategory && item.available)

  const waiterStats = useMemo(() => {
    const myOrders = orders.filter((order) => order.waiterName === user?.name)
    const totalTips = myOrders.reduce((sum, order) => sum + (order.tip || 0), 0)
    const completedOrders = myOrders.filter((o) => o.status === "delivered")

    const allTotalTips = orders.reduce((sum, order) => sum + (order.tip || 0), 0)

    return {
      myOrders,
      totalTips,
      totalOrders: myOrders.length,
      completedOrders: completedOrders.length,
      allTotalTips,
    }
  }, [orders, user?.name])

  const paymentsData = useMemo(() => {
    const myDeliveredOrders = orders.filter(
      (order) => order.waiterName === user?.name && order.status === "delivered" && order.orderType === "dine-in",
    )

    const ordersByTable = myDeliveredOrders.reduce(
      (acc, order) => {
        const table = order.tableNumber || "Sin mesa"
        if (!acc[table]) {
          acc[table] = []
        }
        acc[table].push(order)
        return acc
      },
      {} as Record<string, Order[]>,
    )

    const tableTotals = Object.entries(ordersByTable).map(([table, tableOrders]) => {
      const subtotal = tableOrders.reduce((sum, order) => {
        const orderSubtotal = order.items.reduce((s, item) => s + item.menuItem.price * item.quantity, 0)
        return sum + orderSubtotal
      }, 0)

      const tax = settings.taxEnabled ? subtotal * (settings.taxPercentage / 100) : 0
      const tips = tableOrders.reduce((sum, order) => sum + (order.tip || 0), 0)
      const total = subtotal + tax + tips
      const isPaid = tableOrders.every((order) => order.paid)

      return {
        table,
        orders: tableOrders,
        subtotal,
        tax,
        tips,
        total,
        isPaid,
      }
    })

    const occupiedTables = new Set(
      orders
        .filter((order) => order.orderType === "dine-in" && order.tableNumber && !order.paid)
        .map((order) => order.tableNumber),
    )

    const availableTables = Array.from({ length: settings.numberOfTables }, (_, i) => (i + 1).toString()).filter(
      (table) => !occupiedTables.has(table),
    )

    return {
      tableTotals,
      availableTables,
      occupiedTables: Array.from(occupiedTables),
    }
  }, [orders, user?.name, settings])

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find((item) => item.menuItem.id === menuItem.id)

    if (existingItem) {
      setCart(cart.map((item) => (item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { menuItem, quantity: 1, notes: "" }])
    }
  }

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.menuItem.id !== menuItemId))
    } else {
      setCart(cart.map((item) => (item.menuItem.id === menuItemId ? { ...item, quantity } : item)))
    }
  }

  const updateNotes = (menuItemId: string, notes: string) => {
    setCart(cart.map((item) => (item.menuItem.id === menuItemId ? { ...item, notes } : item)))
  }

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter((item) => item.menuItem.id !== menuItemId))
  }

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
  }

  const handleSubmitOrder = () => {
    if (cart.length === 0) return

    if (!selectedTableNumber) {
      alert("Por favor selecciona un número de mesa")
      return
    }

    addOrder(
      cart,
      user?.name || "Mesero",
      "dine-in",
      { tableNumber: selectedTableNumber },
      undefined,
      undefined,
      undefined,
      "waiter",
    )
    setCart([])
    setSelectedTableNumber("")

    alert("Pedido enviado a cocina exitosamente!")
  }

  const handleMarkAsPaid = (tableOrders: Order[]) => {
    tableOrders.forEach((order) => {
      markOrderAsPaid(order.id)
    })
    alert("Mesa marcada como pagada")
  }

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
    <div className="min-h-screen bg-[#fafada]">
      <DashboardHeader title="Tomar Pedido" role="waiter" />

      <div className="container mx-auto p-4 lg:p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            variant={view === "order" ? "default" : "outline"}
            onClick={() => setView("order")}
            className={view === "order" ? "bg-gradient-to-r from-orange-500 to-red-500" : ""}
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Tomar Pedido
          </Button>
          <Button
            variant={view === "history" ? "default" : "outline"}
            onClick={() => setView("history")}
            className={view === "history" ? "bg-gradient-to-r from-orange-500 to-red-500" : ""}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Mis Pedidos
          </Button>
          <Button
            variant={view === "payments" ? "default" : "outline"}
            onClick={() => setView("payments")}
            className={view === "payments" ? "bg-gradient-to-r from-orange-500 to-red-500" : ""}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pagos
          </Button>
        </div>

        {view === "payments" ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mesas Disponibles</CardTitle>
                <CardDescription>
                  {paymentsData.availableTables.length} de {settings.numberOfTables} mesas disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {paymentsData.availableTables.map((table) => (
                    <Badge key={table} variant="outline" className="px-4 py-2 text-base bg-green-50 border-green-300">
                      Mesa {table}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mesas por Cobrar</CardTitle>
                <CardDescription>Pedidos entregados pendientes de pago</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] sm:h-[600px] pr-4">
                  {paymentsData.tableTotals.length > 0 ? (
                    <div className="space-y-4">
                      {paymentsData.tableTotals
                        .filter((t) => !t.isPaid)
                        .map((tableData) => (
                          <Card key={tableData.table} className="border-2">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-xl">Mesa {tableData.table}</CardTitle>
                                <Badge variant="outline" className="bg-yellow-50 border-yellow-300">
                                  Pendiente de pago
                                </Badge>
                              </div>
                              <CardDescription>{tableData.orders.length} pedidos</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                {tableData.orders.map((order) => (
                                  <div key={order.id} className="border-l-2 border-orange-300 pl-3">
                                    <p className="text-sm font-medium">Pedido #{order.orderNumber}</p>
                                    {order.items.map((item, idx) => (
                                      <p key={idx} className="text-sm text-gray-600">
                                        {item.quantity}x {item.menuItem.name}
                                      </p>
                                    ))}
                                  </div>
                                ))}
                              </div>

                              <div className="border-t pt-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Subtotal:</span>
                                  <span>${tableData.subtotal.toFixed(2)}</span>
                                </div>
                                {settings.taxEnabled && (
                                  <div className="flex justify-between text-sm text-blue-600">
                                    <span>IVA ({settings.taxPercentage}%):</span>
                                    <span>${tableData.tax.toFixed(2)}</span>
                                  </div>
                                )}
                                {tableData.tips > 0 && (
                                  <div className="flex justify-between text-sm text-green-600">
                                    <span>Propina:</span>
                                    <span>${tableData.tips.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                  <span>Total a Pagar:</span>
                                  <span className="text-orange-600">${tableData.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button
                                onClick={() => handleMarkAsPaid(tableData.orders)}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Marcar como Pagado
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      {paymentsData.tableTotals.filter((t) => !t.isPaid).length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <p className="text-lg font-medium">No hay mesas pendientes de pago</p>
                          <p className="text-sm mt-2">Todas las mesas han sido cobradas</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg font-medium">No hay pedidos entregados</p>
                      <p className="text-sm mt-2">Los pedidos entregados aparecerán aquí</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        ) : view === "history" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total de Pedidos</CardDescription>
                  <CardTitle className="text-3xl text-blue-600">{waiterStats.totalOrders}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{waiterStats.completedOrders} completados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Mis Propinas</CardDescription>
                  <CardTitle className="text-3xl text-green-600">${waiterStats.totalTips.toFixed(2)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">De mis pedidos</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardDescription className="text-green-700">Propinas del Equipo</CardDescription>
                  <CardTitle className="text-3xl text-green-600">${waiterStats.allTotalTips.toFixed(2)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-green-600">Compartidas con cocina y meseros</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Propina Promedio</CardDescription>
                  <CardTitle className="text-3xl text-orange-600">
                    $
                    {waiterStats.totalOrders > 0
                      ? (waiterStats.totalTips / waiterStats.totalOrders).toFixed(2)
                      : "0.00"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Por pedido</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Historial de Pedidos</CardTitle>
                <CardDescription>Todos tus pedidos y su estado actual</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] sm:h-[600px] pr-4">
                  {waiterStats.myOrders.length > 0 ? (
                    <div className="space-y-4">
                      {waiterStats.myOrders.map((order) => {
                        const subtotal = order.items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
                        const tax = settings.taxEnabled ? subtotal * (settings.taxPercentage / 100) : 0

                        return (
                          <Card key={order.id}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-lg">Pedido #{order.orderNumber}</CardTitle>
                                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                                    {getStatusLabel(order.status)}
                                  </Badge>
                                  {order.paid && (
                                    <Badge className="bg-green-600 text-white">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Pagado
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">Subtotal: ${subtotal.toFixed(2)}</p>
                                  {settings.taxEnabled && (
                                    <p className="text-sm text-blue-600">IVA: ${tax.toFixed(2)}</p>
                                  )}
                                  {order.tip && order.tip > 0 && (
                                    <p className="text-sm text-green-600 font-semibold">
                                      Propina: ${order.tip.toFixed(2)}
                                      {order.tipPercentage && ` (${order.tipPercentage}%)`}
                                    </p>
                                  )}
                                  <p className="text-lg font-bold text-orange-600">${order.total.toFixed(2)}</p>
                                </div>
                              </div>
                              <CardDescription>
                                {new Date(order.createdAt).toLocaleString("es-ES", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span>
                                      {item.quantity}x {item.menuItem.name}
                                      {item.notes && <span className="text-gray-500 ml-2">({item.notes})</span>}
                                    </span>
                                    <span className="font-semibold">
                                      ${(item.menuItem.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {order.customerName && (
                                <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                                  <p>Cliente: {order.customerName}</p>
                                  {order.tableNumber && <p>Mesa: {order.tableNumber}</p>}
                                  {order.deliveryAddress && <p>Dirección: {order.deliveryAddress}</p>}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg font-medium">No has tomado pedidos aún</p>
                      <p className="text-sm mt-2">Comienza a tomar pedidos para ver tu historial aquí</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Menú</CardTitle>
                  <CardDescription>Selecciona los items para el pedido</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 pb-8">
                    <Label className="text-sm font-semibold mb-2 block">Categoría</Label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 border rounded-md bg-white sm:hidden"
                    >
                      {Object.entries(categories).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="hidden sm:block">
                      <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 w-full">
                        {Object.entries(categories).map(([key, label]) => (
                          <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
                            {label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>

                  <ScrollArea className="h-[400px] sm:h-[600px] pr-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                      {filteredItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="aspect-video relative overflow-hidden">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardHeader className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base">{item.name}</CardTitle>
                              <span className="text-base font-bold text-orange-600 whitespace-nowrap">
                                ${item.price.toFixed(2)}
                              </span>
                            </div>
                            <CardDescription className="text-sm line-clamp-2">{item.description}</CardDescription>
                          </CardHeader>
                          <CardFooter className="p-4 pt-0">
                            <Button
                              onClick={() => addToCart(item)}
                              className="w-full bg-[#12372b] hover:bg-[#14532d]"
                              size="sm"
                            >
                              Agregar
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-6 lg:sticky">
                <CardHeader>
                  <CardTitle>Pedido Actual</CardTitle>
                  <CardDescription>
                    {cart.length} {cart.length === 1 ? "item" : "items"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-4 p-4 bg-[#12372b] border border-orange-200 rounded-lg">
                    <Label className="text-sm font-semibold mb-2 text-[#fafada] block">Número de Mesa *</Label>
                    <select
                      value={selectedTableNumber}
                      onChange={(e) => setSelectedTableNumber(e.target.value)}
                      className="w-full p-2 border rounded-md bg-white"
                    >
                      <option value="">Seleccionar mesa...</option>
                      {paymentsData.availableTables.map((table) => (
                        <option key={table} value={table}>
                          Mesa {table}
                        </option>
                      ))}
                    </select>
                    {paymentsData.availableTables.length === 0 && (
                      <p className="text-xs text-red-600 mt-1">Todas las mesas están ocupadas</p>
                    )}
                  </div>

                  <ScrollArea className="h-[300px] sm:h-[400px] pr-4">
                    {cart.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No hay items en el pedido</p>
                        <p className="text-sm mt-2">Agrega items del menú</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <Card key={item.menuItem.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{item.menuItem.name}</h4>
                                  <p className="text-sm text-orange-600 font-semibold">
                                    ${item.menuItem.price.toFixed(2)}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromCart(item.menuItem.id)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  ×
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs">Cantidad:</Label>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                                      className="h-7 w-7 p-0"
                                    >
                                      -
                                    </Button>
                                    <Input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) =>
                                        updateQuantity(item.menuItem.id, Number.parseInt(e.target.value) || 0)
                                      }
                                      className="h-7 w-12 text-center p-0"
                                      min="1"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                                      className="h-7 w-7 p-0"
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-xs">Notas:</Label>
                                  <Textarea
                                    value={item.notes || ""}
                                    onChange={(e) => updateNotes(item.menuItem.id, e.target.value)}
                                    placeholder="Ej: sin cebolla"
                                    className="h-16 text-xs resize-none"
                                  />
                                </div>

                                <div className="text-right">
                                  <span className="text-sm font-semibold">
                                    Subtotal: ${(item.menuItem.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <div className="w-full flex items-center justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-orange-600">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="w-full flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCart([])}
                      disabled={cart.length === 0}
                      className="flex-1"
                    >
                      Limpiar
                    </Button>
                    <Button
                      onClick={handleSubmitOrder}
                      disabled={cart.length === 0}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      Enviar a Cocina
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
