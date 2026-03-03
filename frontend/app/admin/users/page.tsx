"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Status awal diubah dari 'all' menjadi 'user' agar tabel langsung memuat data Pelanggan
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleTab, setRoleTab] = useState("user");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const response = await api.get(
          `/admin/users?page=${currentPage}&role=${roleTab}&search=${activeSearch}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setUsers(response.data.data.data);
        setTotalPages(response.data.data.last_page);
      } catch (err) {
        setError("Gagal memuat data pengguna.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, roleTab, activeSearch]);

  const handleRoleChange = (role: string) => {
    setRoleTab(role);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
    setCurrentPage(1);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Data Pengguna</h2>
        <p className="text-sm text-gray-500">
          Kelola akses dan profil pengguna sistem
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        {/* Navigasi Tab Peran */}
        <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => handleRoleChange("admin")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${roleTab === "admin" ? "bg-white text-amber-600 shadow-sm border border-gray-200" : "text-gray-600 hover:text-gray-900"}`}
          >
            Administrator
          </button>
          <button
            onClick={() => handleRoleChange("user")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${roleTab === "user" ? "bg-white text-amber-600 shadow-sm border border-gray-200" : "text-gray-600 hover:text-gray-900"}`}
          >
            Pelanggan
          </button>
        </div>

        {/* Kolom Pencarian */}
        <form
          onSubmit={handleSearch}
          className="w-full md:w-auto flex items-center"
        >
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <button
            type="submit"
            className="ml-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium border border-gray-300 transition-colors"
          >
            Cari
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nama Lengkap
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Peran
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tanggal Bergabung
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex justify-center mb-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                    </div>
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-red-500 font-medium"
                  >
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Tidak ada pengguna yang cocok dengan kriteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-amber-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md ${user.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
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
