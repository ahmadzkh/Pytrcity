"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Pelanggan");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

    if (!document.querySelector(`script[src="${snapScript}"]`)) {
      const script = document.createElement("script");
      script.src = snapScript;
      script.setAttribute("data-client-key", clientKey || "");
      script.async = true;
      document.body.appendChild(script);
    }

    const verifySession = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await api.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.role === "admin") {
          router.push("/admin");
          return;
        }
        setUserName(response.data.name);
      } catch (err) {
        localStorage.removeItem("access_token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            Pytricity
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            href="/dashboard"
            className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${pathname === "/dashboard" ? "bg-amber-50 text-amber-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            Pembayaran Tagihan
          </Link>
          <Link
            href="/transactions"
            className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${pathname === "/transactions" ? "bg-amber-50 text-amber-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            Riwayat Transaksi
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between shadow-sm z-0">
          <h1 className="text-lg font-semibold text-gray-800">
            Area Pelanggan
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              {userName}
            </span>
            <div className="h-9 w-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shadow-inner uppercase">
              {userName.charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
