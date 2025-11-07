"use client"

import { useState } from "react"
import { useMenu } from "@/lib/menu-context"
import { CustomerCart } from "@/components/customer-cart"
import type { OrderItem } from "@/lib/types"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { MenuSection } from "@/components/menu-section"
import { Footer } from "@/components/footer"
import { FloatingIconsBackground } from "@/components/FloatingIconsBackground"

export default function HomePage() {
  const [cartItems, setCartItems] = useState<OrderItem[]>([])

  const addToCart = (menuItem: any) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.menuItem.id === menuItem.id)
      if (existingItem) {
        return prev.map((item) => (item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { menuItem, quantity: 1, notes: "" }]
    })
  }

  return (
    <div className="min-h-screen bg-[#12372b]">
      <FloatingIconsBackground />
      <Header />
      <HeroSection />
      <MenuSection addToCart={addToCart} />
      <Footer />
      <CustomerCart cartItems={cartItems} setCartItems={setCartItems} />
    </div>
  )
}
