"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

/**
 * AdminLayout Component
 * Mengelola tata letak utama untuk area Administrator.
 * Menyediakan proteksi rute tingkat tinggi (Superuser) dan memastikan
 * integritas sesi melalui validasi peran yang ketat namun non-destruktif.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // --- State Management ---
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Melakukan verifikasi otoritas akses khusus untuk peran 'admin'.
   * Menerapkan pengalihan rute cerdas agar pengguna dengan peran lain (Partner/Customer)
   * dikembalikan ke area kerja mereka tanpa kehilangan sesi aktif.
   */
  const verifyAdminAccess = useCallback(async () => {
    // 1. Abaikan pengecekan jika pengguna berada di halaman login admin
    if (pathname === "/admin/login") {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("access_token");

    // 2. Cek keberadaan token secara lokal
    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      // 3. Validasi token dan ambil profil dari peladen
      const response = await api.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userRole = response.data.role;

      /**
       * 4. Logika Non-Destructive Redirection
       * Jika pengguna memiliki sesi valid tetapi mencoba masuk ke rute Admin
       * padahal perannya bukan Admin, kembalikan mereka ke dashboard masing-masing.
       */
      if (userRole !== "admin") {
        if (userRole === "partner") {
          router.push("/partner");
        } else {
          router.push("/dashboard"); // Default untuk customer
        }
        return;
      }

      // 5. Otorisasi diberikan jika peran terkonfirmasi sebagai admin
      setIsAuthorized(true);
    } catch (err: any) {
      /**
       * 6. Penanganan Galat Sesi
       * Sesi (token) hanya dibersihkan jika peladen menolak otentikasi (401/403).
       * Menghindari penghapusan token secara tidak sengaja akibat ralat jaringan.
       */
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("access_token");
      }
      router.push("/admin/login");
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    verifyAdminAccess();
  }, [verifyAdminAccess]);

  /**
   * Menghapus sesi Administrator dan mengarahkan kembali ke login panel admin.
   */
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/admin/login");
  };

  // Skip rendering layout utama untuk halaman login admin
  if (pathname === "/admin/login") return <>{children}</>;

  // State: Tampilan pemuatan selama proses verifikasi hak akses
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-amber-500"></div>
          <p className="text-gray-400 font-medium">Memverifikasi Otoritas...</p>
        </div>
      </div>
    );
  }

  // Mencegah rendering komponen anak jika belum terverifikasi
  if (!isAuthorized) return null;

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      {/* Sidebar Navigasi Admin (Tema Gelap) */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col shadow-md z-10">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Pytricity <span className="text-amber-500">Admin</span>
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            href="/admin"
            className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
              pathname === "/admin"
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                : "text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            Ikhtisar Sistem
          </Link>
          <Link
            href="/admin/transactions"
            className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
              pathname === "/admin/transactions"
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                : "text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            Manajemen Transaksi
          </Link>
          <Link
            href="/admin/users"
            className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
              pathname === "/admin/users"
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                : "text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            Data Pengguna
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Konten Utama Administrator */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-gray-800 border-b border-gray-700 flex items-center px-8 justify-between shadow-sm z-0">
          <h1 className="text-lg font-semibold text-white">
            Panel Administrator
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-400">
              Mode Superuser
            </span>
            <div className="h-9 w-9 rounded-full bg-amber-500 text-gray-900 flex items-center justify-center font-bold shadow-inner">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
