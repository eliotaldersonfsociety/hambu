import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMenu } from "@/lib/menu-context"
import type { OrderItem } from "@/lib/types"
import { Plus } from "lucide-react"

interface MenuSectionProps {
  addToCart: (menuItem: any) => void
}

export function MenuSection({ addToCart }: MenuSectionProps) {
  const { menuItems } = useMenu()

  const categories = {
    main: "Platos Principales",
    side: "Acompañamientos",
    drink: "Bebidas",
    dessert: "Postres",
  }

  const groupedItems = menuItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, typeof menuItems>,
  )

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2 text-[#fafada]" style={{ fontFamily: "var(--font-fascinate)" }} >Nuestro Menú</h2>
        <p className="text-[#fafada]">Todos nuestros platillos son preparados al momento</p>
      </div>

      <div className="space-y-16">
        {Object.entries(categories).map(([categoryKey, categoryName]) => {
          const items = groupedItems[categoryKey]
          if (!items || items.length === 0) return null

          return (
            <section key={categoryKey} id={categoryKey}>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-[#fafada] text-[#fafada]" style={{ fontFamily: "var(--font-fascinate)" }}></span>
                <span className="text-[#fafada]" style={{ fontFamily: "var(--font-fascinate)" }}>{categoryName}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-[#fafada]">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {!item.available && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="secondary" className="text-lg">
                            No disponible
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-xl text-[#12372b]">{item.name}</CardTitle>
                        <span className="text-xl font-bold text-orange-600 whitespace-nowrap">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <CardDescription className="text-pretty text-[#12372b]">{item.description}</CardDescription>
                      <Button
                        onClick={() => addToCart(item)}
                        disabled={!item.available}
                        className="w-full mt-4 bg-[#12372b] hover:bg-green-800"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar al pedido
                      </Button>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}