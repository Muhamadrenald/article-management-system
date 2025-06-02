"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  useEffect(() => {
    // Redirect to articles page as default
    redirect("/admin/articles");
  }, []);

  return (
    <div className="p-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting to admin dashboard...</p>
      </div>
    </div>
  );
}
