"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ShoppingCart, Trash2, Plus, Minus, X, Package, Truck, Upload, CheckCircle2 } from "lucide-react"
import type { OrderItem, OrderType, MenuItem } from "@/lib/types"
import { useOrders } from "@/lib/orders-context"
import { useSettings } from "@/lib/settings-context"
import { useMenu } from "@/lib/menu-context"

interface CustomerCartProps {
  cartItems: OrderItem[]
  setCartItems: React.Dispatch<React.SetStateAction<OrderItem[]>>
}

export function CustomerCart({ cartItems, setCartItems }: CustomerCartProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showPayment, setShowPayment] = useState(false) // Added payment step
  const [orderType, setOrderType] = useState<OrderType>("takeout") // Changed default orderType to "takeout"
  const [customerName, setCustomerName] = useState("")
  const [tableNumber, setTableNumber] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedTipPercentage, setSelectedTipPercentage] = useState<number | null>(null)
  const [customTip, setCustomTip] = useState("")
  const [paymentProof, setPaymentProof] = useState<string | null>(null) // Added payment proof state
  const [paymentFileName, setPaymentFileName] = useState<string>("") // Added file name state
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("transfer")
  const { addOrder } = useOrders()
  const { settings } = useSettings()
  const { menuItems } = useMenu()

  const total = cartItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const taxAmount = settings.taxEnabled ? total * (settings.taxPercentage / 100) : 0

  const tipAmount =
    selectedTipPercentage !== null
      ? total * (selectedTipPercentage / 100)
      : customTip
        ? Number.parseFloat(customTip) || 0
        : 0

  const finalTotal = total + taxAmount + tipAmount

    const getRecommendations = (): any[] => {
    if (cartItems.length === 0) return []

    const cartCategories = new Set(cartItems.map((item) => item.menuItem.category))
    const cartItemIds = new Set(cartItems.map((item) => item.menuItem.id))

    const recommendations: any[] = []

    // Suggest items from complementary categories
    if (cartCategories.has("main") && !cartCategories.has("drink")) {
      recommendations.push(...menuItems.filter((item) => item.category === "drink" && item.available))
    }
    if (cartCategories.has("main") && !cartCategories.has("side")) {
      recommendations.push(...menuItems.filter((item) => item.category === "side" && item.available))
    }
    if ((cartCategories.has("main") || cartCategories.has("side")) && !cartCategories.has("dessert")) {
      recommendations.push(...menuItems.filter((item) => item.category === "dessert" && item.available))
    }

    // Also add items from the same categories as fallback
    cartCategories.forEach((category) => {
      recommendations.push(...menuItems.filter((item) => item.category === category && item.available))
    })

    // Filter out items already in cart and remove duplicates
    const uniqueRecommendations = recommendations
      .filter((item) => !cartItemIds.has(item.id))
      .filter((item, index, self) => self.findIndex((i) => i.id === item.id) === index)

    return uniqueRecommendations.slice(0, 4)
  }

  const recommendedProducts = getRecommendations()

  const addRecommendedToCart = (menuItem: any) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.menuItem.id === menuItem.id)
      if (existingItem) {
        return prev.map((item) => (item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { menuItem, quantity: 1, notes: "" }]
    })
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.menuItem.id === itemId) {
            const newQuantity = item.quantity + delta
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
          }
          return item
        })
        .filter((item): item is OrderItem => item !== null),
    )
  }

  const removeItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.menuItem.id !== itemId))
  }

  const updateNotes = (itemId: string, notes: string) => {
    setCartItems((prev) => prev.map((item) => (item.menuItem.id === itemId ? { ...item, notes } : item)))
  }

  const handleCheckout = () => {
    if (!customerName.trim()) return

    if (orderType === "dine-in" && !tableNumber.trim()) return
    if (orderType === "delivery" && (!phoneNumber.trim() || !deliveryAddress.trim())) return

    setShowCheckout(false)
    if (orderType === "takeout" && paymentMethod === "cash") {
      handleCompleteOrder()
    } else {
      setShowPayment(true)
    }
  }

  const handleCompleteOrder = () => {
    if (paymentMethod === "transfer" && !paymentProof) {
      alert("Por favor sube el comprobante de pago")
      return
    }

    let waiterInfo = `Cliente: ${customerName}`
    if (orderType === "dine-in") {
      waiterInfo += ` - Mesa ${tableNumber}`
    } else if (orderType === "takeout") {
      waiterInfo += ` - Para Llevar (${paymentMethod === "cash" ? "Pago en Efectivo" : "Transferencia"})`
    } else if (orderType === "delivery") {
      waiterInfo += ` - Domicilio: ${deliveryAddress} - Tel: ${phoneNumber}`
    }

    addOrder(
      cartItems,
      waiterInfo,
      orderType,
      {
        customerName,
        tableNumber: orderType === "dine-in" ? tableNumber : undefined,
        phoneNumber: orderType === "delivery" ? phoneNumber : undefined,
        deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
      },
      tipAmount,
      selectedTipPercentage || undefined,
      paymentProof || undefined,
      "web",
      paymentMethod,
    )

    setCartItems([])
    setShowPayment(false)
    setShowSuccess(true)
    setCustomerName("")
    setTableNumber("")
    setPhoneNumber("")
    setDeliveryAddress("")
    setOrderType("takeout")
    setSelectedTipPercentage(null)
    setCustomTip("")
    setPaymentProof(null)
    setPaymentFileName("")
    setPaymentMethod("transfer")

    setTimeout(() => {
      setShowSuccess(false)
      setIsOpen(false)
    }, 5000)
  }

  const isFormValid = () => {
    if (!customerName.trim()) return false
    if (orderType === "dine-in" && !tableNumber.trim()) return false
    if (orderType === "delivery" && (!phoneNumber.trim() || !deliveryAddress.trim())) return false
    return true
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 1024 * 1024) {
      alert("La imagen debe ser menor a 1MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida")
      return
    }

    setPaymentFileName(file.name)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPaymentProof(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  if (itemCount === 0 && !showSuccess) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#fafada] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all z-40 flex items-center gap-2 border-2 border-orange-500 animate-bounce"
      >
        <img width="36" height="36" src="https://img.icons8.com/3d-fluency/94/hamburger.png" alt="hamburger" className="sm:w-12 sm:h-12" />
        {itemCount > 0 && <Badge className="bg-[#12372b] text-[#fafada] font-bold px-2 py-1">{itemCount}</Badge>}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-end">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
          <Card className="relative w-full md:w-96 h-[80vh] md:h-[90vh] md:m-4 flex flex-col rounded-t-2xl md:rounded-2xl overflow-hidden bg-[#fafada]">
            <div className="bg-[#12372b] text-[#fafada] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h2 className="text-lg font-bold">Tu Pedido</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {showSuccess && (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#12372b] rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-[#fafada]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#12372b] mb-2">¡Pedido Enviado!</h3>
                  <p className="text-[#12372b] mb-2">Tu pedido ha sido recibido.</p>
                  <p className="text-sm text-orange-600 font-semibold">
                    En unos minutos te llamamos para la confirmación de tu pedido.
                  </p>
                </div>
              </div>
            )}

            {!showSuccess && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {cartItems.map((item) => (
                    <Card key={item.menuItem.id} className="p-4">
                      <div className="flex gap-3">
                        <img
                          src={item.menuItem.image || "/placeholder.svg"}
                          alt={item.menuItem.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm">{item.menuItem.name}</h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.menuItem.id)}
                              className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-orange-600 font-bold">${item.menuItem.price.toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.menuItem.id, -1)}
                              className="h-7 w-7"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.menuItem.id, 1)}
                              className="h-7 w-7"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Textarea
                            placeholder="Notas especiales (opcional)"
                            value={item.notes}
                            onChange={(e) => updateNotes(item.menuItem.id, e.target.value)}
                            className="mt-2 text-sm h-16 resize-none"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {recommendedProducts.length > 0 && (
                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">¿Quieres agregar algo más?</h3>
                      <div className="space-y-3">
                        {recommendedProducts.map((item) => (
                          <Card key={item.id} className="p-3 hover:shadow-md transition-shadow">
                            <div className="flex gap-3">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                                <p className="text-xs text-gray-600 line-clamp-1">{item.description}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-sm font-bold text-orange-600">${item.price.toFixed(2)}</span>
                                  <Button
                                    size="sm"
                                    onClick={() => addRecommendedToCart(item)}
                                    className="h-7 bg-orange-500 hover:bg-orange-600"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Agregar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t p-4 space-y-4 bg-white">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-orange-600">${total.toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-[#12372b] hover:bg-[#0e2a1f] text-[#fafada] font-bold"
                    disabled={cartItems.length === 0}
                  >
                    Hacer Pedido
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-[#fafada]">
          <DialogHeader>
            <DialogTitle className="text-[#12372b]">Confirmar Pedido</DialogTitle>
            <DialogDescription className="text-[#12372b]">Por favor ingresa tus datos para completar el pedido</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Tipo de Pedido</Label>
              <RadioGroup value={orderType} onValueChange={(value) => setOrderType(value as OrderType)}> 
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 bg-[#12372b] text-[#fafada]">
                  <RadioGroupItem value="takeout" id="takeout" />
                  <Label htmlFor="takeout" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Package className="w-4 h-4 text-[#fafada]" />
                    <div>
                      <div className="font-medium">Para Llevar</div>
                      <div className="text-xs text-[#fafada]">Recoger en el local</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 bg-[#12372b] text-[#fafada]">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Truck className="w-4 h-4 text-[#fafada]" />
                    <div>
                      <div className="font-medium">Domicilio</div>
                      <div className="text-xs text-[#fafada]">Entrega a tu dirección</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {orderType === "takeout" && (
              <div className="space-y-3">
                <Label>Método de Pago</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as "cash" | "transfer")}
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                      <div>
                        <div className="font-medium">Efectivo</div>
                        <div className="text-xs text-gray-500">Pagar al momento de la entrega</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer" className="flex items-center gap-2 cursor-pointer flex-1">
                      <div>
                        <div className="font-medium">Transferencia</div>
                        <div className="text-xs text-gray-500">Subir comprobante de pago</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-white"
              />
            </div>

            {orderType === "dine-in" && (
              <div className="space-y-2">
                <Label htmlFor="table">Número de Mesa *</Label>
                <Input
                  id="table"
                  placeholder="Ej: 5"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="bg-white"
                />
              </div>
            )}

            {orderType === "delivery" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    placeholder="Ej: 555-1234"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección de Entrega *</Label>
                  <Textarea
                    id="address"
                    placeholder="Calle, número, colonia, referencias..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="h-20 resize-none bg-white"
                  />
                </div>
              </>
            )}

            {settings.tipsEnabled && (
              <div className="space-y-3 border-t pt-4">
                <Label>Propina (Opcional)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {settings.tipPercentages.map((percentage) => (
                    <Button
                      key={percentage}
                      type="button"
                      variant={selectedTipPercentage === percentage ? "default" : "outline"}
                      className={selectedTipPercentage === percentage ? "bg-[#12372b] text-[#fafada]" : "bg-white"}
                      onClick={() => {
                        setSelectedTipPercentage(percentage)
                        setCustomTip("")
                      }}
                    >
                      {percentage}%
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customTip">O ingresa una cantidad personalizada</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">$</span>
                    <Input
                      id="customTip"
                      type="number"
                      placeholder="0.00"
                      value={customTip}
                      onChange={(e) => {
                        setCustomTip(e.target.value)
                        setSelectedTipPercentage(null)
                      }}
                      step="0.01"
                      min="0"
                      className="bg-white"
                    />
                  </div>
                </div>
                {tipAmount > 0 && (
                  <p className="text-sm text-gray-600">
                    Propina: <span className="font-semibold text-orange-600">${tipAmount.toFixed(2)}</span>
                  </p>
                )}
              </div>
            )}

            <div className="bg-orange-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              {settings.taxEnabled && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">IVA ({settings.taxPercentage}%):</span>
                  <span className="font-semibold">${taxAmount.toFixed(2)}</span>
                </div>
              )}
              {tipAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Propina:</span>
                  <span className="font-semibold">${tipAmount.toFixed(2)}</span>
                </div>
              )}
              {orderType === "delivery" && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-semibold">$30.00</span>
                </div>
              )}
              <div className="border-t pt-2 flex items-center justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-orange-600">
                  ${(finalTotal + (orderType === "delivery" ? 30 : 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={!isFormValid()}
              className="bg-[#12372b] text-[#fafada] hover:bg-[#0e2a1f]"
            >
              Continuar al Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-[#12372b] text-[#fafada]">
          <DialogHeader>
            <DialogTitle>Información de Pago</DialogTitle>
            <DialogDescription className="text-[#fafada]">Realiza tu depósito y sube el comprobante</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-orange-900">Cuentas Bancarias</h3>
              {settings.bankAccounts.map((account) => (
                <div key={account.id} className="bg-white rounded-lg p-3 space-y-1">
                  <p className="font-semibold text-gray-900">{account.bankName}</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Cuenta:</span> {account.accountNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Titular:</span> {account.accountHolder}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tipo:</span> {account.accountType}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-[#12372b] font-semibold mb-2">Monto a depositar:</p>
              <p className="text-2xl font-bold text-orange-600">
                ${(finalTotal + (orderType === "delivery" ? 30 : 0)).toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-proof">Comprobante de Pago *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                <input
                  id="payment-proof"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="payment-proof" className="cursor-pointer">
                  {paymentProof ? (
                    <div className="space-y-2">
                      <CheckCircle2 className="w-12 h-12 text-[#fafada] mx-auto" />
                      <p className="text-sm font-medium text-[#fafada]">Imagen cargada</p>
                      <p className="text-xs text-[#fafada]">{paymentFileName}</p>
                      <img
                        src={paymentProof || "/placeholder.svg"}
                        alt="Comprobante"
                        className="max-h-40 mx-auto rounded mt-2"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-[#fafada] mx-auto" />
                      <p className="text-sm font-medium text-[#fafada]">Haz clic para subir tu comprobante</p>
                      <p className="text-xs text-[#fafada]">Máximo 1MB - JPG, PNG</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <span className="font-semibold">Importante:</span> En unos minutos te llamamos para la confirmación de
                tu pedido.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayment(false)} className="bg-[#fafada] text-[#12372b]">
              Volver
            </Button>
            <Button
              onClick={handleCompleteOrder}
              disabled={!paymentProof}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              Enviar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
