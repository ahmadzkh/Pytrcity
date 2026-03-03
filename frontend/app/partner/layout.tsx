"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

/**
 * PartnerLayout Component
 * Mengelola tata letak utama khusus untuk entitas Mitra / Agen PPOB.
 * Mengimplementasikan pengalihan rute non-destruktif untuk menjaga integritas sesi
 * bagi pengguna dengan peran berbeda (Admin/Customer).
 */
export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // --- State Management ---
  const [userName, setUserName] = useState("Agen PPOB");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  /**
   * Mengintegrasikan skrip Midtrans Snap secara dinamis.
   * Diperlukan untuk fungsionalitas Top-Up Saldo dompet mitra.
   */
  const injectMidtransScript = useCallback(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

    if (!document.querySelector(`script[src="${snapScript}"]`)) {
      const script = document.createElement("script");
      script.src = snapScript;
      script.setAttribute("data-client-key", clientKey || "");
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  /**
   * Melakukan verifikasi otoritas akses khusus untuk peran 'partner'.
   * Mengarahkan pengguna ke dasbor yang relevan tanpa menghapus token jika sesi masih valid.
   */
  const verifyPartnerAccess = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    // 1. Validasi keberadaan token di penyimpanan lokal
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // 2. Permintaan data profil ke peladen backend
      const response = await api.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Jalur akses data diperbaiki sesuai struktur: response.data.role
      const userRole = response.data.role;

      /**
       * 3. Logika Pengalihan Non-Destruktif
       * Memindahkan pengguna ke rute yang sesuai berdasarkan hak akses
       * tanpa menghancurkan sesi (token) yang ada.
       */
      if (userRole !== "partner") {
        if (userRole === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard"); // Rute untuk 'customer'
        }
        return;
      }

      // 4. Inisialisasi status terotorisasi bagi mitra
      setUserName(response.data.name);
      setIsAuthorized(true);
    } catch (err: any) {
      /**
       * 5. Penanganan Galat Sesi Khusus
       * Token hanya dihapus jika peladen secara eksplisit menolak kredensial (401).
       */
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
      }
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    injectMidtransScript();
    verifyPartnerAccess();
  }, [injectMidtransScript, verifyPartnerAccess]);

  /**
   * Menghapus sesi aktif dan mengarahkan pengguna kembali ke portal login.
   */
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  // State: Indikator Pemuatan Sesi
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-amber-600"></div>
          <p className="text-gray-500 font-medium">
            Memverifikasi Sesi Kemitraan...
          </p>
        </div>
      </div>
    );
  }

  // Mencegah kebocoran UI sebelum otorisasi selesai
  if (!isAuthorized) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigasi Agen */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            Pytricity
            <span className="text-amber-600 ml-1">Agen</span>
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            href="/partner"
            className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
              pathname === "/partner"
                ? "bg-amber-50 text-amber-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            Dasbor Kemitraan
          </Link>
          <Link
            href="/partner/pos"
            className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
              pathname === "/partner/pos"
                ? "bg-amber-50 text-amber-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            Kasir (POS) Transaksi
          </Link>
          <Link
            href="/partner/history"
            className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
              pathname === "/partner/history"
                ? "bg-amber-50 text-amber-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            Riwayat Penjualan
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Konten Area Utama */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between shadow-sm z-0">
          <h1 className="text-lg font-semibold text-gray-800">
            Pusat Agen PPOB
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              {userName}
            </span>
            <div className="h-9 w-9 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold shadow-inner uppercase">
              {userName.charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
