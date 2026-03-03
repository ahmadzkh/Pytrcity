"use client";

import { useState } from "react";
import api from "@/lib/api";

// Deklarasi global untuk Midtrans Snap
declare global {
  interface Window {
    snap: any;
  }
}

interface InquiryData {
  customer_number: string;
  customer_name: string;
  power: string;
  billing_amount: number;
  admin_fee: number;
  total_amount: number;
}

export default function DashboardPage() {
  const [customerNumber, setCustomerNumber] = useState("");
  const [inquiryData, setInquiryData] = useState<InquiryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const response = await api.post(
        "/ppob/inquiry",
        {
          customer_number: customerNumber,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setInquiryData(response.data.data);
    } catch (err: any) {
      setInquiryData(null);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Gagal melakukan pengecekan tagihan. Pastikan nomor pelanggan 12 digit valid.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!inquiryData) return;
    setIsPaying(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const response = await api.post(
        "/ppob/payment",
        {
          customer_number: inquiryData.customer_number,
          amount: inquiryData.total_amount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const snapToken = response.data.data.snap_token;

      window.snap.pay(snapToken, {
        onSuccess: function (result: any) {
          setInquiryData(null);
          setCustomerNumber("");
          alert("Pembayaran berhasil diproses!");
        },
        onPending: function (result: any) {
          alert("Menunggu penyelesaian pembayaran.");
        },
        onError: function (result: any) {
          setError("Terjadi kesalahan pada gerbang pembayaran.");
        },
        onClose: function () {
          setIsPaying(false);
        },
      });
    } catch (err) {
      setError("Gagal menginisiasi pembayaran. Silakan coba kembali.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Cek Tagihan Listrik</h2>
        <p className="text-sm text-gray-500">
          Masukkan nomor meter atau ID pelanggan Anda
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel Pengecekan */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-fit">
          <form onSubmit={handleInquiry} className="space-y-4">
            <div>
              <label
                htmlFor="customerNumber"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Nomor Pelanggan (12 Digit)
              </label>
              <input
                id="customerNumber"
                type="text"
                maxLength={12}
                required
                value={customerNumber}
                onChange={(e) =>
                  setCustomerNumber(e.target.value.replace(/\D/g, ""))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-mono text-lg tracking-wider"
                placeholder="Contoh: 123456789012"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || customerNumber.length < 12}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors ${isLoading || customerNumber.length < 12 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Memeriksa Data..." : "Cek Tagihan"}
            </button>
          </form>
        </div>

        {/* Panel Rincian Tagihan */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-4 mb-4">
            Rincian Tagihan
          </h3>

          {!inquiryData ? (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400">
              <svg
                className="w-12 h-12 mb-3 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm">Data tagihan akan muncul di sini</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Nama Pelanggan</span>
                  <span className="font-semibold text-gray-900">
                    {inquiryData.customer_name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Daya Listrik</span>
                  <span className="font-semibold text-gray-900">
                    {inquiryData.power}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Jumlah Tagihan</span>
                  <span className="font-medium text-gray-900">
                    Rp {inquiryData.billing_amount.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Biaya Admin</span>
                  <span className="font-medium text-gray-900">
                    Rp {inquiryData.admin_fee.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-base font-bold text-gray-800">
                    Total Pembayaran
                  </span>
                  <span className="text-xl font-extrabold text-amber-600">
                    Rp {inquiryData.total_amount.toLocaleString("id-ID")}
                  </span>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={isPaying}
                  className={`w-full py-3 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isPaying ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isPaying
                    ? "Membuka Gerbang Pembayaran..."
                    : "Bayar Sekarang"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
