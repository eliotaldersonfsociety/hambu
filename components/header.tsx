import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="bg-[#12372b] text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img width="36" height="36" src="https://img.icons8.com/3d-fluency/94/hamburger.png" alt="hamburger" className="sm:w-12 sm:h-12" />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-[#fafada]" style={{ fontFamily: "var(--font-fascinate)" }}>Burguer Club</h1>
              <p className="text-xs sm:text-sm text-[#fafada]">Auténtica comida de calle</p>
            </div>
          </div>
          <Link href="/login">
            <Button variant="secondary" className="bg-[#fafada] text-[#12372b] hover:bg-orange-50 text-sm sm:text-base">
              Acceso Personal
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}