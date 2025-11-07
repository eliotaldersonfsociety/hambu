export function HeroSection() {
  return (
    <section className="bg-[#12372b] text-white min-h-screen flex flex-col md:flex-row items-center justify-center md:justify-between gap-8 md:gap-12 overflow-hidden">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
        {/* Imagen principal primero en móvil */}
        <div className="w-full md:w-1/2 flex justify-center relative order-1 md:order-2">
          <img
            src="/h.png"
            alt="hamburguesa"
            className="w-[450px] sm:w-[500px] md:w-[950px] lg:w-[1000px] max-w-none drop-shadow-2xl transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Texto + mini hamburguesas */}
        <div className="text-center md:text-left md:w-1/2 order-2 md:order-1 -translate-y-25">
          <span className="block text-xs sm:text-sm tracking-[0.4em] text-[#fafada] uppercase pl-0 sm:pl-35">
            THE ULTIMATE
          </span>

          <h2
            className="text-5xl sm:text-6xl md:text-8xl mb-6 leading-none text-[#fafada]"
            style={{ fontFamily: "var(--font-fascinate)" }}
          >
            Burger Club
          </h2>

          <p
            className="text-sm sm:text-base md:text-lg text-[#fafada] mx-auto md:mx-0 mb-10"
            style={{ lineHeight: "1.1" }}
            >
            Descubre los auténticos sabores de calle en cada bocado.<br/>
            Preparado fresco todos los días.
        </p>


          {/* Mini hamburguesas debajo del texto */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 pl-0 md:pl-10">
            <img
              src="/2.png"
              alt="Mini hamburguesa 1"
              className="w-20 h-20 sm:w-24 md:w-20 md:h-20 object-cover rounded-xl border border-white/20 hover:scale-110 transition-transform duration-300"
            />
            <img
              src="/1.png"
              alt="Mini hamburguesa 2"
              className="w-20 h-20 sm:w-24 md:w-20 md:h-20 object-cover rounded-xl border border-white/20 hover:scale-110 transition-transform duration-300"
            />
            <img
              src="/3.png"
              alt="Mini hamburguesa 3"
              className="w-20 h-20 sm:w-24 md:w-20 md:h-20 object-cover rounded-xl border border-white/20 hover:scale-110 transition-transform duration-300"
            />
            <img
              src="/4.png"
              alt="Mini hamburguesa 4"
              className="w-20 h-20 sm:w-24 md:w-20 md:h-20 object-cover rounded-xl border border-white/20 hover:scale-110 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
