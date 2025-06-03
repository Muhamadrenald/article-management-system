"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, Tag, LogOut, Menu, X } from "lucide-react";
import { Notification } from "@/components/ui/notification";

// Definisikan tipe SidebarItem langsung di sini
interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}

const navigation: SidebarItem[] = [
  { name: "Articles", href: "/admin/articles", icon: FileText, current: false },
  { name: "Category", href: "/admin/categories", icon: Tag, current: false },
];

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className = "" }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    type: "success" | "error";
    message: string;
  }>({
    isVisible: false,
    type: "success",
    message: "",
  });

  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const handleLogout = () => {
    try {
      // Hapus cookies
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Hapus localStorage jika ada
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
      }

      // Tampilkan notifikasi sukses
      setNotification({
        isVisible: true,
        type: "success",
        message: "Logout successful! Redirecting...",
      });

      // Redirect ke login dengan delay untuk menampilkan notifikasi
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      // Tampilkan notifikasi error jika ada masalah
      setNotification({
        isVisible: true,
        type: "error",
        message: "Error during logout. Please try again.",
      });

      // Tetap redirect meskipun error
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  const updatedNavigation = navigation.map((item) => ({
    ...item,
    current: pathname.startsWith(item.href),
  }));

  return (
    <>
      {/* Notification Component */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={handleNotificationClose}
      />

      {/* Mobile menu button - positioned to not interfere with content */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-blue-600 text-white transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          ${className}
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center px-6 py-6 border-b border-blue-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">L</span>
            </div>
            <span className="font-semibold text-xl tracking-wide">
              Logoipsum
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-4 flex-1">
          <ul className="space-y-1">
            {updatedNavigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${
                      item.current
                        ? "bg-blue-700 text-white shadow-md border-l-4 border-white"
                        : "text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-md"
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${
                        item.current
                          ? "text-white"
                          : "text-blue-300 group-hover:text-white"
                      }
                    `}
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-blue-100 rounded-lg hover:bg-blue-700 hover:text-white transition-all duration-200 group"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-blue-300 group-hover:text-white" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
