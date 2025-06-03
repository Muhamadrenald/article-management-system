"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "@/lib/axios";
import ArticleCard from "@/components/ArticleCard";
import { Pagination } from "@/components/ui/pagination";
import DebouncedInput from "@/components/DebouncedInput";
import UserDropdown from "@/components/UserDropdown";
import { X } from "lucide-react";

// Fungsi untuk menghasilkan warna kategori yang konsisten
const getCategoryColor = (categoryName: string) => {
  const colors = [
    { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
    { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
    {
      bg: "bg-purple-100",
      text: "text-purple-800",
      border: "border-purple-200",
    },
    {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-200",
    },
    { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },
    {
      bg: "bg-indigo-100",
      text: "text-indigo-800",
      border: "border-indigo-200",
    },
    { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
    {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
    },
    { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-200" },
    { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-200" },
    {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-200",
    },
    {
      bg: "bg-violet-100",
      text: "text-violet-800",
      border: "border-violet-200",
    },
  ];

  // Menggunakan hash sederhana dari nama kategori untuk konsistensi
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    const char = categoryName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("limit", "100");

      if (selectedCategory) {
        params.append("category", selectedCategory);
      } else if (search.trim()) {
        params.append("search", search.trim());
      }

      console.log("Fetching articles with params:", params.toString());

      const res = await axios.get(`/articles?${params.toString()}`);
      console.log("Articles API Response:", res.data);

      const fetchedArticles = res.data.data || [];
      setAllArticles(fetchedArticles);

      // Apply client-side filtering if search term exists and no category is selected
      let filteredArticles = fetchedArticles;
      if (search.trim() && !selectedCategory) {
        const searchLower = search.trim().toLowerCase();
        filteredArticles = fetchedArticles.filter(
          (article: any) =>
            article.title.toLowerCase().includes(searchLower) ||
            (article.content &&
              article.content.toLowerCase().includes(searchLower))
        );
        console.log(
          `Client-side filtering for "${search}" found ${filteredArticles.length} results`
        );
      }

      // Calculate pagination based on filtered results
      const limit = 10;
      const startIndex = (page - 1) * limit;
      const paginatedArticles = filteredArticles.slice(
        startIndex,
        startIndex + limit
      );

      setArticles(paginatedArticles);
      setTotalPages(Math.ceil(filteredArticles.length / limit) || 1);
      setTotalArticles(filteredArticles.length);
      setError(null);
    } catch (err: any) {
      setError(
        err.response?.status === 404
          ? "No articles found for this search or category."
          : "Failed to fetch articles. Please try again later."
      );
      console.error("Error fetching articles:", err);
      setArticles([]);
      setAllArticles([]);
      setTotalArticles(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
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
        const res = await axios.get("/categories?limit=100");
        console.log("Categories Response:", res.data);

        let allCategories: any[] = [];

        if (Array.isArray(res.data)) {
          allCategories = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          allCategories = [...res.data.data];

          if (res.data.totalData && res.data.totalData > res.data.data.length) {
            const totalPages = Math.ceil(res.data.totalData / 100);

            for (let page = 2; page <= totalPages; page++) {
              try {
                const pageRes = await axios.get(
                  `/categories?limit=100&page=${page}`
                );
                if (pageRes.data && Array.isArray(pageRes.data.data)) {
                  allCategories.push(...pageRes.data.data);
                }
              } catch (err) {
                console.error(`Error fetching categories page ${page}:`, err);
              }
            }
          }
        }

        setCategories(allCategories);
        console.log(`Loaded ${allCategories.length} total categories`);
      } catch (err) {
        console.error("Error fetching categories:", err);
        try {
          const fallbackRes = await axios.get("/categories");
          setCategories(fallbackRes.data.data || fallbackRes.data || []);
        } catch (fallbackErr) {
          console.error("Fallback categories fetch also failed:", fallbackErr);
          setCategories([]);
        }
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSearch("");
    }
  };

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
    if (searchValue.trim()) {
      setSelectedCategory("");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fillOpacity='0.8' fillRule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <nav className="relative z-10 flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">L</span>
            </div>
            <span className="text-white font-semibold">Logipsum</span>
          </div>

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
                <option value="">All categories ({categories.length})</option>
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
                placeholder="Search articles by title or content..."
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
                  onClick={handleClearFilters}
                  className="text-white hover:text-blue-200 text-sm ml-2 flex items-center"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600 text-sm">
            {totalArticles > 0 ? (
              <>
                Showing {(page - 1) * 10 + 1} -{" "}
                {Math.min(page * 10, totalArticles)} of {totalArticles} articles
                {search && ` for "${search}"`}
                {selectedCategory &&
                  ` in category "${
                    categories.find((cat) => cat.id === selectedCategory)?.name
                  }"`}
              </>
            ) : (
              "No articles found"
            )}
          </p>

          {(search || selectedCategory) && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading articles...</p>
          </div>
        )}

        {!loading && articles.length === 0 && !error ? (
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
          !loading &&
          articles.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
                {articles.map((article: any) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    getCategoryColor={getCategoryColor}
                  />
                ))}
              </div>
            </div>
          )
        )}

        {/* Pagination */}
        {!loading && articles.length > 0 && (
          <div className="mt-6">
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
