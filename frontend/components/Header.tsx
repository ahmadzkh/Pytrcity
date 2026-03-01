import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white px-8 py-4 sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold tracking-tighter text-gray-900">
          Pytricity<span className="text-electric-500">.</span>
        </div>

        {/* Navigasi Utama */}
        <nav className="hidden md:flex space-x-8 font-medium text-gray-600">
          <Link
            href="#hero"
            className="hover:text-electric-500 transition-colors"
          >
            Beranda
          </Link>
          <Link
            href="#about"
            className="hover:text-electric-500 transition-colors"
          >
            Tentang
          </Link>
          <Link
            href="#services"
            className="hover:text-electric-500 transition-colors"
          >
            Layanan
          </Link>
          <Link
            href="#contact"
            className="hover:text-electric-500 transition-colors"
          >
            Kontak
          </Link>
        </nav>

        {/* Tombol Autentikasi */}
        <div className="space-x-4">
          <Link
            href="/login"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="bg-electric-500 hover:bg-electric-600 text-white px-5 py-2.5 rounded-full font-medium transition-colors"
          >
            Daftar
          </Link>
        </div>
      </div>
    </header>
  );
}
