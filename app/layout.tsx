import type React from "react";
import type { Metadata } from "next";
import { Inter, Fascinate } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { OrdersProvider } from "@/lib/orders-context";
import { MenuProvider } from "@/lib/menu-context";
import { SettingsProvider } from "@/lib/settings-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { FloatingIconsBackground } from "@/components/FloatingIconsBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const fascinate = Fascinate({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-fascinate",
});

export const metadata: Metadata = {
  title: "Burguer Club - Sistema de Pedidos",
  description: "Sistema de gestión de pedidos para food truck",
  generator: "bucaramangamarketing.com",
  applicationName: "Burguer Club - Sistema de Pedidos",
  keywords: ["Burguer Club", "Pedidos", "Comida Callejera", "Gestión de Pedidos"],
  authors: [{ name: "Bucaramanga Marketing", url: "https://bucaramangamarketing.com" }],
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <link
          rel="icon"
          href="https://img.icons8.com/3d-fluency/94/hamburger.png"
          type="image/png"
        />
      </head>
      <body className={`${inter.variable} ${fascinate.variable} font-sans relative`}>
        {/* Fondo animado global */}
        <FloatingIconsBackground />

        {/* Providers globales */}
        <AuthProvider>
          <OrdersProvider>
            <MenuProvider>
              <SettingsProvider>
                <NotificationsProvider>
                  {children}
                </NotificationsProvider>
              </SettingsProvider>
            </MenuProvider>
          </OrdersProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
