"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Order, OrderItem, OrderType, OrderSource } from "./types"

interface OrdersContextType {
  orders: Order[]
  addOrder: (
    items: OrderItem[],
    waiterName: string,
    orderType?: OrderType,
    additionalInfo?: {
      customerName?: string
      tableNumber?: string
      phoneNumber?: string
      deliveryAddress?: string
    },
    tip?: number,
    tipPercentage?: number,
    paymentProof?: string,
    orderSource?: OrderSource,
    paymentMethod?: "cash" | "transfer", // Added paymentMethod parameter
  ) => void
  updateOrderStatus: (orderId: string, status: Order["status"]) => void
  markOrderAsPaid: (orderId: string) => void
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [orderCounter, setOrderCounter] = useState(1)

  useEffect(() => {
    // Load orders from localStorage
    const storedOrders = localStorage.getItem("foodtruck_orders")
    const storedCounter = localStorage.getItem("foodtruck_order_counter")

    if (storedOrders) {
      const parsedOrders = JSON.parse(storedOrders)
      // Convert date strings back to Date objects
      const ordersWithDates = parsedOrders.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        completedAt: order.completedAt ? new Date(order.completedAt) : undefined,
      }))
      setOrders(ordersWithDates)
    }

    if (storedCounter) {
      setOrderCounter(Number.parseInt(storedCounter))
    }
  }, [])

  useEffect(() => {
    // Save orders to localStorage whenever they change
    if (orders.length > 0) {
      localStorage.setItem("foodtruck_orders", JSON.stringify(orders))
    }
  }, [orders])

  useEffect(() => {
    // Save counter to localStorage
    localStorage.setItem("foodtruck_order_counter", orderCounter.toString())
  }, [orderCounter])

  const addOrder = (
    items: OrderItem[],
    waiterName: string,
    orderType: OrderType = "dine-in",
    additionalInfo?: {
      customerName?: string
      tableNumber?: string
      phoneNumber?: string
      deliveryAddress?: string
    },
    tip?: number,
    tipPercentage?: number,
    paymentProof?: string,
    orderSource: OrderSource = "waiter",
    paymentMethod?: "cash" | "transfer", // Added paymentMethod parameter
  ) => {
    const total = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
    const deliveryFee = orderType === "delivery" ? 30 : 0
    const finalTotal = total + deliveryFee + (tip || 0)

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber: orderCounter,
      items,
      total: finalTotal,
      tip,
      tipPercentage,
      status: "pending",
      paid: false,
      waiterName,
      createdAt: new Date(),
      orderType,
      orderSource,
      customerName: additionalInfo?.customerName,
      tableNumber: additionalInfo?.tableNumber,
      phoneNumber: additionalInfo?.phoneNumber,
      deliveryAddress: additionalInfo?.deliveryAddress,
      paymentProof,
      paymentMethod, // Added paymentMethod to order
    }

    setOrders((prev) => [newOrder, ...prev])
    setOrderCounter((prev) => prev + 1)
  }

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              completedAt: status === "delivered" ? new Date() : order.completedAt,
            }
          : order,
      ),
    )
  }

  const markOrderAsPaid = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              paid: true,
            }
          : order,
      ),
    )
  }

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus, markOrderAsPaid }}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider")
  }
  return context
}
