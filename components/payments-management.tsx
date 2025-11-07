"use client"

import { useMemo, useState } from "react"
import { useOrders } from "@/lib/orders-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ImageIcon, Search, User, Globe, DollarSign, Calendar } from "lucide-react"
import type { Order } from "@/lib/types"

export function PaymentsManagement() {
  const { orders } = useOrders()
  const [selectedPaymentProof, setSelectedPaymentProof] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sourceFilter, setSourceFilter] = useState<"all" | "waiter" | "web">("all")

  const paidOrders = useMemo(() => {
    const filtered = orders
      .filter((order) => order.paid)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return filtered
  }, [orders])

  const filteredOrders = useMemo(() => {
    return paidOrders.filter((order) => {
      const matchesSource = sourceFilter === "all" || order.orderSource === sourceFilter
      const matchesSearch =
        searchQuery === "" ||
        order.orderNumber.toString().includes(searchQuery) ||
        order.waiterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSource && matchesSearch
    })
  }, [paidOrders, sourceFilter, searchQuery])

  const stats = useMemo(() => {
    const totalPayments = paidOrders.reduce((sum, order) => sum + order.total, 0)
    const waiterPayments = paidOrders.filter((o) => o.orderSource === "waiter")
    const webPayments = paidOrders.filter((o) => o.orderSource === "web")
    const totalWaiterPayments = waiterPayments.reduce((sum, order) => sum + order.total, 0)
    const totalWebPayments = webPayments.reduce((sum, order) => sum + order.total, 0)
    const webPaymentsWithProof = webPayments.filter((o) => o.paymentProof).length

    return {
      totalPayments,
      totalPaidOrders: paidOrders.length,
      waiterOrdersCount: waiterPayments.length,
      webOrdersCount: webPayments.length,
      totalWaiterPayments,
      totalWebPayments,
      webPaymentsWithProof,
    }
  }, [paidOrders])

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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Pagado</CardDescription>
            <CardTitle className="text-3xl text-green-600">${stats.totalPayments.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{stats.totalPaidOrders} pedidos pagados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pagos de Meseros</CardDescription>
            <CardTitle className="text-3xl text-blue-600">${stats.totalWaiterPayments.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{stats.waiterOrdersCount} pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pagos desde Web</CardDescription>
            <CardTitle className="text-3xl text-orange-600">${stats.totalWebPayments.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{stats.webOrdersCount} pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Comprobantes Web</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{stats.webPaymentsWithProof}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">De {stats.webOrdersCount} pedidos web</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Pagos</CardTitle>
          <CardDescription>Todos los pedidos pagados del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por número de pedido, mesero o cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={sourceFilter} onValueChange={(v) => setSourceFilter(v as any)} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="waiter">
                  <User className="w-3 h-3 mr-1" />
                  Meseros
                </TabsTrigger>
                <TabsTrigger value="web">
                  <Globe className="w-3 h-3 mr-1" />
                  Web
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Payments Table */}
          <ScrollArea className="h-[600px] pr-4">
            {filteredOrders.length > 0 ? (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-bold text-lg">Pedido #{order.orderNumber}</span>
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {getStatusLabel(order.status)}
                        </Badge>
                        {order.orderSource === "waiter" ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <User className="w-3 h-3 mr-1" />
                            Mesero
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <Globe className="w-3 h-3 mr-1" />
                            Web
                          </Badge>
                        )}
                        {order.paid && (
                          <Badge className="bg-green-500 text-white">
                            <DollarSign className="w-3 h-3 mr-1" />
                            Pagado
                          </Badge>
                        )}
                        {order.paymentMethod && (
                          <Badge variant={order.paymentMethod === "cash" ? "secondary" : "outline"}>
                            {order.paymentMethod === "cash" ? "Efectivo" : "Transferencia"}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700">
                          <span className="font-medium">Atendido por:</span> {order.waiterName}
                        </p>
                        {order.customerName && (
                          <p className="text-gray-700">
                            <span className="font-medium">Cliente:</span> {order.customerName}
                          </p>
                        )}
                        <p className="text-gray-600">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(order.createdAt).toLocaleString("es-ES", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">{order.items.length}</span> items •{" "}
                          <span className="font-medium">Mesa:</span> {order.tableNumber || "N/A"}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)} className="text-xs">
                          Ver Detalle
                        </Button>
                        {order.orderSource === "web" && order.paymentMethod === "transfer" && order.paymentProof && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPaymentProof(order.paymentProof || null)}
                            className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Ver Comprobante
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="text-right mt-4 sm:mt-0 w-full sm:w-auto">
                      <p className="text-2xl font-bold text-green-600">${order.total.toFixed(2)}</p>
                      {order.tip && order.tip > 0 && (
                        <p className="text-sm text-gray-600">Propina: ${order.tip.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 text-lg font-medium">No se encontraron pagos</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchQuery || sourceFilter !== "all"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Los pedidos pagados aparecerán aquí"}
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Payment Proof Dialog */}
      <Dialog open={!!selectedPaymentProof} onOpenChange={() => setSelectedPaymentProof(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comprobante de Pago</DialogTitle>
            <DialogDescription>Imagen del comprobante subido por el cliente desde la web</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
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

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Pedido #{selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>Información completa del pedido pagado</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <Badge className={`${getStatusColor(selectedOrder.status)} text-white mt-1`}>
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fuente</p>
                  <Badge variant="outline" className="mt-1">
                    {selectedOrder.orderSource === "waiter" ? (
                      <>
                        <User className="w-3 h-3 mr-1" /> Mesero
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3 mr-1" /> Web
                      </>
                    )}
                  </Badge>
                </div>
                {selectedOrder.paymentMethod && (
                  <div>
                    <p className="text-sm text-gray-600">Método de Pago</p>
                    <Badge variant={selectedOrder.paymentMethod === "cash" ? "secondary" : "outline"} className="mt-1">
                      {selectedOrder.paymentMethod === "cash" ? "Efectivo" : "Transferencia"}
                    </Badge>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Atendido por</p>
                  <p className="font-medium">{selectedOrder.waiterName}</p>
                </div>
                {selectedOrder.customerName && (
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Mesa</p>
                  <p className="font-medium">{selectedOrder.tableNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Items del Pedido</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.menuItem.name}</p>
                        <p className="text-sm text-gray-600">
                          Cantidad: {item.quantity} × ${item.menuItem.price.toFixed(2)}
                        </p>
                        {item.notes && <p className="text-xs text-gray-500 mt-1">Nota: {item.notes}</p>}
                      </div>
                      <p className="font-semibold text-orange-600">
                        ${(item.quantity * item.menuItem.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>
                      $
                      {selectedOrder.items
                        .reduce((sum, item) => sum + item.quantity * item.menuItem.price, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  {selectedOrder.tip && selectedOrder.tip > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Propina ({selectedOrder.tipPercentage}%)</span>
                      <span>${selectedOrder.tip.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-green-600 pt-2 border-t">
                    <span>Total Pagado</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
