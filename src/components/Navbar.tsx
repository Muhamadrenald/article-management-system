"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isLoggedIn, getUserRole } from "@/lib/auth";
import UserDropdown from "@/components/UserDropdown";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [role, setRole] = useState<string>("user");

  useEffect(() => {
    // Inisialisasi state
    setLoggedIn(isLoggedIn());
    setRole(getUserRole());

    // Listener untuk perubahan localStorage
    const handleStorageChange = () => {
      console.log("Storage changed, updating navbar state"); // Debugging
      setLoggedIn(isLoggedIn());
      setRole(getUserRole());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="flex justify-between items-center">
        {/* Left side navigation - hidden for admin role */}
        {role !== "admin" && (
          <ul className="flex space-x-4">
            {loggedIn ? (
              <>
                {/* <li>
                  <Link href="/" className="hover:text-gray-300">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/articles" className="hover:text-gray-300">
                    Articles
                  </Link>
                </li> */}
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" className="hover:text-gray-300">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-gray-300">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        )}

        {/* Right side - User dropdown or login/register */}
        <div className={role === "admin" ? "ml-auto" : ""}>
          {loggedIn ? (
            <UserDropdown />
          ) : (
            <ul className="flex space-x-4">
              <li>
                <Link href="/login" className="hover:text-gray-300">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-gray-300">
                  Register
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}
