export type UserRole = "waiter" | "kitchen" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: "main" | "side" | "drink" | "dessert"
  image: string
  available: boolean
}

export interface OrderItem {
  menuItem: MenuItem
  quantity: number
  notes?: string
}

export type OrderType = "dine-in" | "takeout" | "delivery"
export type OrderSource = "web" | "waiter"
export type PaymentMethod = "cash" | "transfer"

export interface Order {
  id: string
  orderNumber: number
  items: OrderItem[]
  total: number
  tip?: number
  tipPercentage?: number
  status: "pending" | "preparing" | "ready" | "delivered"
  paid: boolean
  waiterName: string
  createdAt: Date
  completedAt?: Date
  orderType: OrderType
  orderSource: OrderSource
  tableNumber?: string
  customerName?: string
  phoneNumber?: string
  deliveryAddress?: string
  paymentProof?: string
  paymentMethod?: PaymentMethod
}

export interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountHolder: string
  accountType: string
}

export interface Settings {
  tipsEnabled: boolean
  tipPercentages: number[]
  taxEnabled: boolean
  taxPercentage: number
  bankAccounts: BankAccount[]
  numberOfTables: number
}

export interface Notification {
  id: string
  orderId: string
  orderNumber: number
  waiterName: string
  message: string
  createdAt: Date
  read: boolean
}
