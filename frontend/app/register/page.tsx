"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";

/**
 * RegisterPage Component
 * Menangani pendaftaran pengguna baru untuk peran 'customer' dan 'partner'.
 * Dilengkapi dengan proteksi sesi aktif dan validasi peran reaktif.
 */
export default function RegisterPage() {
  const router = useRouter();

  // --- State Management ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "customer", // Default role disesuaikan dengan constraint Postgres
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  /**
   * Helper untuk menentukan rute pengalihan berdasarkan peran.
   * @param role - String peran (admin | partner | customer)
   */
  const getRedirectPath = (role: string): string => {
    if (role === "admin") return "/admin";
    if (role === "partner") return "/partner";
    return "/dashboard"; // Default untuk customer
  };

  /**
   * Memeriksa apakah pengguna sudah memiliki sesi aktif.
   * Jika sesi valid ditemukan, pengguna akan dialihkan secara otomatis.
   */
  const verifySession = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (token) {
      try {
        const response = await api.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Menggunakan response.data.role sesuai struktur API terverifikasi
        const path = getRedirectPath(response.data.role);
        router.push(path);
        return;
      } catch (err) {
        // Hapus token jika sudah tidak valid/expired di peladen
        localStorage.removeItem("access_token");
      }
    }

    setIsCheckingSession(false);
  }, [router]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  /**
   * Menangani perubahan nilai pada input teks.
   * @param e - React Change Event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  /**
   * Menangani perubahan peran melalui tombol radio visual.
   * @param selectedRole - Nilai peran yang dipilih (customer | partner)
   */
  const handleRoleChange = (selectedRole: string) => {
    setFormData({ ...formData, role: selectedRole });
  };

  /**
   * Menangani proses pendaftaran akun (Submit Handler).
   * Meliputi validasi client-side sederhana dan sinkronisasi token.
   * @param e - React Form Event
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi dasar: Kesesuaian kata sandi
    if (formData.password !== formData.password_confirmation) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Eksekusi permintaan pendaftaran ke API
      const response = await api.post("/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role,
      });

      // 2. Persistensi token akses yang dikembalikan peladen
      localStorage.setItem("access_token", response.data.access_token);

      // 3. Pengalihan rute berdasarkan input peran pengguna
      const targetPath = getRedirectPath(formData.role);
      router.push(targetPath);
    } catch (err: any) {
      // Menangani pesan ralat dari peladen (Laravel)
      const message =
        err.response?.data?.message ||
        "Pendaftaran gagal. Periksa kembali data Anda atau koneksi peladen.";
      setError(message);
      setIsLoading(false);
    }
  };

  // State: Loading saat pengecekan sesi aktif
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
            Buat Akun Baru
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Mulai kelola transaksi Anda dengan Pytricity
          </p>
        </div>

        {/* Display Alert Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-5">
            {/* Pemilihan Peran (Visual Radio Button) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jenis Akun
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleChange("customer")}
                  className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-full border transition-all duration-200 focus:outline-none ${
                    formData.role === "customer"
                      ? "bg-amber-500 text-white border-amber-500 shadow-md"
                      : "bg-white text-amber-500 border-amber-500 hover:bg-amber-50"
                  }`}
                >
                  Pelanggan
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("partner")}
                  className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-full border transition-all duration-200 focus:outline-none ${
                    formData.role === "partner"
                      ? "bg-amber-500 text-white border-amber-500 shadow-md"
                      : "bg-white text-amber-500 border-amber-500 hover:bg-amber-50"
                  }`}
                >
                  Mitra / Agen
                </button>
              </div>
            </div>

            {/* Form Inputs */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700"
              >
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-colors"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
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
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-colors"
                value={formData.email}
                onChange={handleChange}
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
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-colors"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="password_confirmation"
                className="block text-sm font-semibold text-gray-700"
              >
                Konfirmasi Kata Sandi
              </label>
              <input
                id="password_confirmation"
                type="password"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-colors"
                value={formData.password_confirmation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors shadow-sm ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Memproses Data..." : "Daftar Sekarang"}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
