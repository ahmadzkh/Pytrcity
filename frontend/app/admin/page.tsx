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
        <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-green-100 text-green-800">
          Selesai
        </span>
      );
    if (status === "pending")
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-100 text-amber-800">
          Menunggu
        </span>
      );
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-red-100 text-red-800">
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
      <div className="p-4 bg-red-50 text-red-600 rounded-lg font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            Rp {data?.stats.revenue.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Transaksi Berhasil
          </p>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            {data?.stats.success_count}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Pengguna Terdaftar
          </p>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            {data?.stats.user_count}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Transaksi Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ID Transaksi
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Pengguna
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  No. Pelanggan
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nominal
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data?.recent_transactions.map((trx) => (
                <tr
                  key={trx.id}
                  className="hover:bg-amber-50/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {trx.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {trx.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {trx.customer_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
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
