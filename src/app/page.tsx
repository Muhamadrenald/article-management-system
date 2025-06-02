"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "@/lib/axios";
import { getUserRole } from "@/lib/auth";
import ArticleCard from "@/components/ArticleCard";

export default function LandingPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("user");
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    // Pastikan role diambil di sisi klien
    const userRole = getUserRole();
    setRole(userRole);

    // Jika role adalah admin, arahkan ke halaman admin
    if (userRole === "admin") {
      router.push("/admin/articles");
    }
  }, [router]);

  useEffect(() => {
    // Ambil artikel unggulan (3 artikel terbaru)
    const fetchFeaturedArticles = async () => {
      try {
        const res = await axios.get("/articles?page=1");
        const articles = res.data.articles || [];
        setFeaturedArticles(articles.slice(0, 3));
      } catch (err) {
        console.error("Error fetching featured articles:", err);
      }
    };

    // Ambil daftar kategori
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/categories");
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchFeaturedArticles();
    fetchCategories();
  }, []);

  // Hanya tampilkan landing page untuk role user
  if (role !== "user") {
    return null; // Atau bisa menampilkan loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold mb-4">
            Welcome to Our Platform
          </h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Discover a wide range of articles on various topics. Dive into tech,
            lifestyle, and more!
          </p>
          <Link
            href="/articles"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition"
          >
            Explore Articles
          </Link>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Featured Articles
          </h2>
          {featuredArticles.length === 0 ? (
            <p className="text-center text-gray-600">
              No featured articles available.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArticles.map((article: any) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Browse by Category
          </h2>
          {categories.length === 0 ? (
            <p className="text-center text-gray-600">
              No categories available.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {categories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/articles?category=${category.id}`}
                  className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition text-center text-gray-700 font-semibold hover:bg-blue-50"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2025 Your Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
