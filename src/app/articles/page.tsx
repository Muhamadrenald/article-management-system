"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "@/lib/axios";
import ArticleCard from "@/components/ArticleCard";
import Pagination from "@/components/Pagination";
import DebouncedInput from "@/components/DebouncedInput";
import UserDropdown from "@/components/UserDropdown";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());

      // Jika kategori dipilih, prioritaskan kategori
      if (selectedCategory) {
        params.append("category", selectedCategory);
      }
      // Jika ada pencarian dan tidak ada kategori yang dipilih
      else if (search.trim()) {
        // Langsung kirim sebagai search parameter untuk pencarian artikel berdasarkan title/name
        params.append("search", search.trim());
      }

      const res = await axios.get(`/articles?${params.toString()}`);
      setArticles(res.data.data || []);
      setTotalPages(Math.ceil(res.data.total / res.data.limit) || 1);
      setTotalArticles(res.data.total || 0);
      setError(null);
    } catch (err: any) {
      setError(
        err.response?.status === 404
          ? "No articles found for this search or category."
          : "Failed to fetch articles. Please try again later."
      );
      console.error("Error fetching articles:", err);
      setArticles([]);
    }
  }, [page, search, selectedCategory]);

  // Reset halaman ke 1 ketika search atau kategori berubah
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/categories");
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Handler untuk clear search ketika kategori dipilih
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSearch(""); // Clear search ketika kategori dipilih
    }
  };

  // Handler untuk clear kategori ketika user mulai search
  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
    if (searchValue.trim()) {
      setSelectedCategory(""); // Clear kategori ketika user mulai search
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <nav className="relative z-10 flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">L</span>
            </div>
            <span className="text-white font-semibold">Logipsum</span>
          </div>

          {/* Replace static user info with UserDropdown */}
          <UserDropdown />
        </nav>

        <div className="relative z-10 px-6 py-16 text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 mb-6">
            <span className="text-white text-sm">Blog portal</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            The Journal : Design Resources,
            <br />
            Interviews, and Industry News
          </h1>

          <p className="text-blue-100 text-lg mb-8 max-w-md mx-auto">
            Your daily dose of design insights!
          </p>

          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-0 bg-white/90 backdrop-blur-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              >
                <option value="">All categories</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-2">
              <DebouncedInput
                value={search}
                onChange={handleSearchChange}
                placeholder="Search articles by title or name..."
                debounceMs={300}
                className="w-full px-4 py-3 rounded-lg border-0 bg-white/90 backdrop-blur-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              />
            </div>
          </div>

          {/* Tampilkan indikator filter aktif */}
          {(search || selectedCategory) && (
            <div className="mt-4 flex justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                {selectedCategory && (
                  <span className="text-white text-sm">
                    Category:{" "}
                    {
                      categories.find((cat) => cat.id === selectedCategory)
                        ?.name
                    }
                  </span>
                )}
                {search && (
                  <span className="text-white text-sm">Search: "{search}"</span>
                )}
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("");
                  }}
                  className="text-white hover:text-blue-200 text-sm ml-2"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-gray-600 text-sm">
            Showing: {articles.length} of {totalArticles} articles
            {search && ` for "${search}"`}
            {selectedCategory &&
              ` in category "${
                categories.find((cat) => cat.id === selectedCategory)?.name
              }"`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {articles.length === 0 && !error ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No articles found
              </h3>
              <p className="text-gray-600">
                {search
                  ? `No articles found matching "${search}"`
                  : selectedCategory
                  ? `No articles found in the selected category`
                  : "Try adjusting your search or category filter to find what you're looking for."}
              </p>
            </div>
          </div>
        ) : (
          articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
              {articles.map((article: any, index: number) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
