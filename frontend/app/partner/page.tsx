"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface WalletData {
  balance: number;
}

export default function PartnerDashboard() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await api.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Pastikan struktur respons: response.data.data.wallet
        if (response.data.data && response.data.data.wallet) {
          setWallet(response.data.data.wallet);
        } else {
          // Jika user adalah mitra tapi tidak punya wallet (kasus langka), set 0
          setWallet({ balance: 0 });
        }
      } catch (err: any) {
        // Tampilkan pesan error yang lebih detail di konsol untuk debug
        console.error(
          "Gagal mengambil data saldo agen:",
          err.response?.data || err.message,
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletInfo();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Ikhtisar Kemitraan</h2>
        <p className="text-sm text-gray-500">
          Pantau performa dan ketersediaan saldo operasi Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel Saldo Dompet */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Saldo Deposit Agen
              </h3>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                Aktif
              </span>
            </div>
            {isLoading ? (
              <div className="h-10 w-48 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-4xl font-extrabold text-gray-900">
                Rp{" "}
                {wallet ? Number(wallet.balance).toLocaleString("id-ID") : "0"}
              </p>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm text-sm text-center">
              + Top Up Saldo
            </button>
            <Link
              href="/partner/pos"
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm text-sm text-center"
            >
              Buka Kasir
            </Link>
          </div>
        </div>

        {/* Panel Informasi Ringkas */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
            Status Operasional
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="bg-green-100 p-3 rounded-lg text-green-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Koneksi PPOB Pusat
                </p>
                <p className="font-bold text-gray-900">Terhubung Stabil</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Potensi Profit (Bulan Ini)
                </p>
                <p className="font-bold text-gray-900">Rp 0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
