export function Footer() {
  return (
    <footer className="bg-[#12372b] py-8 mt-16">
      <div className="container mx-auto px-4 text-center">
        {/* Texto */}
        <p className="text-[#fafada]">
          © 2025{" "}
          <span style={{ fontFamily: "var(--font-fascinate)" }}>
            Burger Club
          </span>
          . Todos los derechos reservados por{" "}
          <a
            href="https://rennyardiladev.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#fafada]/80"
          >
            rennyardiladev
          </a>
          .
        </p>
        <p className="text-[#fafada] text-sm mt-2">
          Síguenos en nuestras redes sociales
        </p>

        {/* Íconos sociales */}
        <div className="flex justify-center items-center gap-4 mt-4">
          {/* Instagram */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#fafada] hover:scale-110 transition-transform duration-300">
            <img
              width="22"
              height="22"
              src="https://img.icons8.com/ios/50/instagram-new--v1.png"
              alt="Instagram"
            />
          </div>

          {/* Facebook */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#fafada] hover:scale-110 transition-transform duration-300">
            <img
              width="22"
              height="22"
              src="https://img.icons8.com/ios/50/facebook-f.png"
              alt="Facebook"
            />
          </div>

          {/* X (Twitter) */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#fafada] hover:scale-110 transition-transform duration-300">
            <img
              width="22"
              height="22"
              src="https://img.icons8.com/ios/50/twitterx--v2.png"
              alt="Twitter / X"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
