"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface TransactionItem {
  id: number;
  order_id: string;
  customer_number: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  user: {
    name: string;
  } | null;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // State untuk Paginasi dan Filter
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        // Panggil API dengan parameter halaman dan filter
        const response = await api.get(
          `/admin/transactions?page=${currentPage}&status=${statusFilter}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        // Struktur respons paginasi Laravel
        setTransactions(response.data.data.data);
        setTotalPages(response.data.data.last_page);
      } catch (err) {
        setError("Gagal memuat daftar transaksi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, statusFilter]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Manajemen Transaksi</h2>
          <p className="text-sm text-gray-500">
            Pantau seluruh aktivitas pembayaran sistem
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="status" className="text-sm font-medium text-white">
            Filter Status:
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-700"
          >
            <option value="all">Semua Transaksi</option>
            <option value="paid">Selesai (Paid)</option>
            <option value="pending">Menunggu (Pending)</option>
            <option value="failed">Gagal (Failed)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ID Pesanan
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex justify-center mb-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                    </div>
                    Memuat data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-red-500 font-medium"
                  >
                    {error}
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Tidak ada data transaksi yang ditemukan.
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => (
                  <tr
                    key={trx.id}
                    className="hover:bg-amber-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(trx.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trx.order_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {trx.user?.name || "Anonim"}
                      <span className="block text-xs text-gray-400 font-mono mt-0.5">
                        No: {trx.customer_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      Rp {trx.total_amount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(trx.payment_status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Kontrol Paginasi */}
        {!isLoading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <span className="text-sm text-gray-600">
              Halaman{" "}
              <span className="font-semibold text-gray-900">{currentPage}</span>{" "}
              dari{" "}
              <span className="font-semibold text-gray-900">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 text-sm font-medium rounded-md border ${currentPage === 1 ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-amber-600"}`}
              >
                Sebelumnya
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 text-sm font-medium rounded-md border ${currentPage === totalPages ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-amber-600"}`}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
