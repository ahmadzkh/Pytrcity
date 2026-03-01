import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigasi Sederhana */}
      <header className="w-full px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tighter text-gray-900">
          Pytricity<span className="text-electric-500">.</span>
        </div>
        <nav className="space-x-4">
          <Link
            href="/login"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="bg-electric-500 hover:bg-electric-600 text-white px-5 py-2 rounded-full font-medium transition-colors"
          >
            Daftar
          </Link>
        </nav>
      </header>

      {/* Bagian Hero */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 mt-12 mb-24">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight max-w-4xl leading-tight">
          Bayar Tagihan Listrik Anda <br className="hidden md:block" />
          Lebih Cepat dan <span className="text-electric-500">Aman</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
          Sistem pembayaran PPOB modern untuk mengelola tagihan listrik
          pascabayar Anda tanpa antrean. Pantau pengeluaran dan simpan ID
          pelanggan Anda dengan mudah.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/inquiry"
            className="bg-electric-500 hover:bg-electric-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg shadow-electric-500/30 transition-all transform hover:-translate-y-1"
          >
            Cek Tagihan Sekarang
          </Link>
          <Link
            href="/features"
            className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold transition-all"
          >
            Pelajari Fitur
          </Link>
        </div>
      </section>
    </main>
  );
}
