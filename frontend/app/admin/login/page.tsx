"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Evaluasi sesi aktif saat halaman dimuat
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const response = await api.get("/user", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.role === "admin") {
            router.push("/admin");
            return;
          }
        } catch (err) {
          localStorage.removeItem("access_token");
        }
      }
      setIsCheckingSession(false);
    };

    verifySession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const loginResponse = await api.post("/login", { email, password });
      const token = loginResponse.data.access_token;
      localStorage.setItem("access_token", token);

      const userResponse = await api.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userResponse.data.role !== "admin") {
        localStorage.removeItem("access_token");
        setError(
          "Akses ditolak. Kredensial tidak memiliki otoritas administrator.",
        );
        setIsLoading(false);
        return;
      }

      router.push("/admin");
    } catch (err: any) {
      localStorage.removeItem("access_token");
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Kredensial tidak valid atau peladen tidak merespons.");
      }
      setIsLoading(false);
    }
  };

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
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Portal <span className="text-amber-500">Administrator</span>
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Otentikasi khusus manajemen Pytricity
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
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
                Email Administrator
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
              className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Memverifikasi..." : "Akses Panel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
