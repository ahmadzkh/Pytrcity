"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";

/**
 * LoginPage Component
 * * Menangani proses otentikasi pengguna, verifikasi sesi aktif,
 * dan pengalihan rute berdasarkan peran (admin, partner, customer).
 */
export default function LoginPage() {
  const router = useRouter();

  // --- State Management ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  /**
   * Helper untuk menentukan rute pengalihan berdasarkan peran pengguna.
   * @param role - Peran yang didapat dari respons API (admin | partner | customer)
   */
  const getRedirectPath = (role: string): string => {
    switch (role) {
      case "admin":
        return "/admin";
      case "partner":
        return "/partner";
      default:
        return "/dashboard"; // Default untuk role 'customer'
    }
  };

  /**
   * Memverifikasi keberadaan dan validitas sesi (token) yang tersimpan.
   * Dipanggil saat komponen pertama kali dimuat (Initial Mount).
   */
  const verifySession = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (token) {
      try {
        // Melakukan pengecekan validitas token ke endpoint /user
        const response = await api.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Jika token valid, langsung arahkan ke dashboard sesuai role
        const path = getRedirectPath(response.data.role);
        router.push(path);
        return; // Menghentikan eksekusi jika sudah dialihkan
      } catch (err) {
        // Jika token tidak valid atau expired, bersihkan storage
        localStorage.removeItem("access_token");
      }
    }

    // Izinkan pengguna melihat form login jika tidak ada sesi valid
    setIsCheckingSession(false);
  }, [router]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  /**
   * Menangani pengiriman formulir login (Submit Handler).
   * @param e - React Form Event
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Kirim permintaan otentikasi ke server
      const loginResponse = await api.post("/login", { email, password });
      const token = loginResponse.data.access_token;

      // 2. Simpan token akses ke local storage
      localStorage.setItem("access_token", token);

      // 3. Ambil profil pengguna untuk mendapatkan informasi role terbaru
      const userResponse = await api.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 4. Arahkan pengguna berdasarkan peran yang tersimpan di basis data
      const targetPath = getRedirectPath(userResponse.data.role);
      router.push(targetPath);
    } catch (err: any) {
      // Membersihkan token jika proses pengambilan profil gagal setelah login
      localStorage.removeItem("access_token");

      // Menangani pesan kesalahan dari server atau pesan default
      const message =
        err.response?.data?.message ||
        "Kredensial tidak valid atau peladen tidak merespons.";
      setError(message);
      setIsLoading(false);
    }
  };

  // Menampilkan indikator pemuatan selama pengecekan sesi berlangsung
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Selamat Datang
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masuk ke akun Pytricity Anda
          </p>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700"
              >
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Kata Sandi
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Memverifikasi..." : "Masuk Sistem"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Belum memiliki akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
