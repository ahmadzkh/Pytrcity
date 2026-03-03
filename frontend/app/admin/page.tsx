"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface DashboardData {
  stats: {
    revenue: number;
    success_count: number;
    user_count: number;
  };
  recent_transactions: {
    id: string;
    user: string;
    customer_number: string;
    amount: number;
    status: string;
    date: string;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await api.get("/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data.data);
      } catch (err) {
        setError("Gagal mengambil data dari peladen.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === "paid")
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-green-500/20 text-green-400 border border-green-500/30">
          Selesai
        </span>
      );
    if (status === "pending")
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Menunggu
        </span>
      );
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
        Gagal
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/50 text-red-400 border border-red-800 rounded-lg font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-400">Total Pendapatan</p>
          <p className="mt-3 text-3xl font-bold text-white">
            Rp {data?.stats.revenue.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-400">
            Transaksi Berhasil
          </p>
          <p className="mt-3 text-3xl font-bold text-white">
            {data?.stats.success_count}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-400">
            Pengguna Terdaftar
          </p>
          <p className="mt-3 text-3xl font-bold text-white">
            {data?.stats.user_count}
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Transaksi Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  ID Transaksi
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Pengguna
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  No. Pelanggan
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Nominal
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {data?.recent_transactions.map((trx) => (
                <tr
                  key={trx.id}
                  className="hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {trx.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {trx.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {trx.customer_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">
                    Rp {trx.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(trx.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
