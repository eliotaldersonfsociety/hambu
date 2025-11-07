"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/lib/settings-context"
import { Percent, DollarSign } from "lucide-react"

export function SettingsManagement() {
  const { settings, updateSettings } = useSettings()
  const [tipPercentagesInput, setTipPercentagesInput] = useState(settings.tipPercentages.join(", "))

  const handleSaveTipPercentages = () => {
    const percentages = tipPercentagesInput
      .split(",")
      .map((p) => Number.parseInt(p.trim()))
      .filter((p) => !isNaN(p) && p > 0)

    if (percentages.length > 0) {
      updateSettings({ tipPercentages: percentages })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Configuración del Sistema</h2>
        <p className="text-gray-600">Administra las opciones de propinas e impuestos</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tips Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <CardTitle>Propinas</CardTitle>
            </div>
            <CardDescription>Configura las opciones de propina para los clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Habilitar Propinas</Label>
                <p className="text-sm text-gray-500">Permitir que los clientes agreguen propina</p>
              </div>
              <Switch
                checked={settings.tipsEnabled}
                onCheckedChange={(checked) => updateSettings({ tipsEnabled: checked })}
              />
            </div>

            {settings.tipsEnabled && (
              <div className="space-y-2">
                <Label>Porcentajes Sugeridos</Label>
                <p className="text-xs text-gray-500">Ingresa los porcentajes separados por comas (ej: 10, 15, 20)</p>
                <div className="flex gap-2">
                  <Input
                    value={tipPercentagesInput}
                    onChange={(e) => setTipPercentagesInput(e.target.value)}
                    placeholder="10, 15, 20"
                  />
                  <Button onClick={handleSaveTipPercentages} size="sm">
                    Guardar
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  {settings.tipPercentages.map((percentage) => (
                    <div
                      key={percentage}
                      className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {percentage}%
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tax Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-orange-600" />
              <CardTitle>IVA / Impuestos</CardTitle>
            </div>
            <CardDescription>Configura el impuesto aplicado a las ventas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Habilitar IVA</Label>
                <p className="text-sm text-gray-500">Aplicar impuesto a todos los pedidos</p>
              </div>
              <Switch
                checked={settings.taxEnabled}
                onCheckedChange={(checked) => updateSettings({ taxEnabled: checked })}
              />
            </div>

            {settings.taxEnabled && (
              <div className="space-y-2">
                <Label>Porcentaje de IVA</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.taxPercentage}
                    onChange={(e) => updateSettings({ taxPercentage: Number.parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <span className="text-gray-600">%</span>
                </div>
                <p className="text-sm text-gray-500">IVA actual: {settings.taxPercentage}%</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa</CardTitle>
          <CardDescription>Ejemplo de cómo se verá un pedido de $100.00</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">$100.00</span>
            </div>
            {settings.taxEnabled && (
              <div className="flex justify-between text-sm">
                <span>IVA ({settings.taxPercentage}%):</span>
                <span className="font-semibold">${(100 * (settings.taxPercentage / 100)).toFixed(2)}</span>
              </div>
            )}
            {settings.tipsEnabled && (
              <div className="flex justify-between text-sm">
                <span>Propina sugerida ({settings.tipPercentages[1] || 15}%):</span>
                <span className="font-semibold">${(100 * ((settings.tipPercentages[1] || 15) / 100)).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-orange-600">
                $
                {(
                  100 +
                  (settings.taxEnabled ? 100 * (settings.taxPercentage / 100) : 0) +
                  (settings.tipsEnabled ? 100 * ((settings.tipPercentages[1] || 15) / 100) : 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
