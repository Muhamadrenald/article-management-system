"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { LogOut } from "lucide-react";
import { Notification } from "@/components/ui/notification";

// Sesuaikan dengan response API endpoint GET /auth/profile
interface User {
  id: string;
  username: string;
  role: string;
  email?: string; // Optional, bisa ditambahkan di API
  avatar?: string; // Optional, bisa ditambahkan di API
}

interface UserDropdownProps {
  user?: User;
}

export default function UserDropdown({ user: initialUser }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    type: "success" | "error";
    message: string;
  }>({
    isVisible: false,
    type: "success",
    message: "",
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  // Fetch user profile jika tidak ada initial user
  useEffect(() => {
    if (!initialUser) {
      fetchUserProfile();
    }
  }, [initialUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/auth/profile");

      // Sesuaikan dengan struktur API response dari endpoint GET /auth/profile
      // Response: { "id": "uuid", "username": "hehe", "role": "Admin" }
      const userData: User = {
        id: response.data.id,
        username: response.data.username,
        role: response.data.role,
        // email dan avatar bisa ditambahkan jika API menyediakan
      };

      setUser(userData);
      setNotification({
        isVisible: true,
        type: "success",
        message: `Welcome back, ${userData.username}!`,
      });
    } catch (error: any) {
      console.log("Error fetching user profile");
      setError("Failed to load user profile");

      setNotification({
        isVisible: true,
        type: "error",
        message: "Failed to load user profile",
      });

      // Jika error 401 (Unauthorized), redirect ke login
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setNotification({
        isVisible: true,
        type: "success",
        message: "Logging out...",
      });

      // Hapus token dari localStorage terlebih dahulu
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }

      // Reset user state
      setUser(null);
      setIsOpen(false);

      // Optional: panggil logout endpoint jika ada (tapi jangan biarkan error mengganggu proses logout)
      try {
        // Hanya panggil logout endpoint jika benar-benar diperlukan
        // Karena endpoint ini mengembalikan 404, kita skip saja
        // await axios.post("/auth/logout")
        console.log("Client-side logout completed");
      } catch (error) {
        // Ignore logout endpoint errors - client sudah logout
        console.log(
          "Server logout skipped or failed (client logout successful)"
        );
      }

      // Tampilkan notifikasi sukses logout
      setNotification({
        isVisible: true,
        type: "success",
        message: "Logout successful! Redirecting...",
      });

      // Redirect ke halaman login dengan delay
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.log("Error during logout process");
      setNotification({
        isVisible: true,
        type: "error",
        message: "Logout failed, but you will be redirected to login",
      });

      // Force redirect even if logout fails
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Generate avatar initials dari username
  const getInitials = (username?: string) => {
    if (!username || typeof username !== "string") return "U";
    return username.charAt(0).toUpperCase();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-white/20 rounded animate-pulse hidden md:block"></div>
      </div>
    );
  }

  // Error state - show login button
  if (error || !user) {
    return (
      <div className="flex items-center space-x-2">
        <Notification
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={handleNotificationClose}
        />
        <button
          onClick={() => router.push("/login")}
          className="text-white text-sm hover:text-blue-200 transition-colors px-3 py-1 rounded border border-white/20 hover:bg-white/10"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={handleNotificationClose}
      />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        aria-label="User menu"
        disabled={isLoggingOut}
      >
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-medium">
            {getInitials(user.username)}
          </span>
        </div>
        <span className="text-white text-sm hidden md:block">
          {user.username}
        </span>
        <svg
          className="w-4 h-4 text-white transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.username}</p>
            <p className="text-xs text-blue-600 font-medium capitalize">
              {user.role}
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
