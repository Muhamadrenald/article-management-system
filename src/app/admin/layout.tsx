"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getToken, getUserRole, isLoggedIn } from "@/lib/auth";
import axios from "@/lib/axios";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isLoggedIn()) {
          router.push("/login");
          return;
        }

        const token = getToken();
        const role = getUserRole();

        if (role !== "admin") {
          router.push("/unauthorized");
          return;
        }

        // Verifikasi token dengan API (opsional, uncomment jika diperlukan)
        /*
        const response = await axios.get("/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.user.role.toLowerCase() !== "admin") {
          router.push("/unauthorized");
          return;
        }
        */

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Akan redirect di useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 lg:ml-0">
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </div>
  );
}
