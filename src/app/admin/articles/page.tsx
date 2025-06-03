"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit3, Trash2, Eye, X } from "lucide-react";
import axios from "@/lib/axios";
import type { Article, Category, PaginatedResponse } from "@/types";
import DebouncedInput from "@/components/DebouncedInput";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Notification } from "@/components/ui/notification";
import { Pagination } from "@/components/ui/pagination";

// Fungsi untuk membuat excerpt dari content
const createExcerpt = (content: string, maxLength = 100): string => {
  const text = content.replace(/<[^>]+>/g, "");
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State untuk delete modal dan notification
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    article: Article | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    article: null,
    isDeleting: false,
  });

  const [notification, setNotification] = useState<{
    isVisible: boolean;
    type: "success" | "error";
    message: string;
  }>({
    isVisible: false,
    type: "success",
    message: "",
  });

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // If there's a search term, fetch all data for client-side filtering
      if (search.trim()) {
        params.append("page", "1");
        params.append("limit", "100"); // Fetch more for client-side filtering
        params.append("search", search.trim());
      } else {
        // Use server-side pagination when no search
        params.append("page", page.toString());
        params.append("limit", "10");
      }

      if (selectedCategory) {
        params.append("category", selectedCategory);
      }

      console.log("Fetching articles with params:", params.toString());

      const res = await axios.get<PaginatedResponse<Article>>(
        `/articles?${params.toString()}&admin=true`
      );

      console.log("API Response:", res.data);

      // Validasi respons
      if (!res.data || !Array.isArray(res.data.data)) {
        throw new Error("Invalid API response structure");
      }

      let finalArticles = res.data.data;
      let finalTotal = res.data.total || res.data.data.length;

      // If there's a search term, do client-side filtering and pagination
      if (search.trim()) {
        const searchLower = search.trim().toLowerCase();
        const filteredArticles = res.data.data.filter(
          (article) =>
            article.title.toLowerCase().includes(searchLower) ||
            createExcerpt(article.content).toLowerCase().includes(searchLower)
        );

        console.log(
          `Client-side filtering for "${search}" found ${filteredArticles.length} results`
        );

        // Apply client-side pagination
        const limit = 10;
        const startIndex = (page - 1) * limit;
        finalArticles = filteredArticles.slice(startIndex, startIndex + limit);
        finalTotal = filteredArticles.length;
        setTotalPages(Math.ceil(filteredArticles.length / limit) || 1);
      } else {
        // Use server-side pagination data
        finalArticles = res.data.data;
        finalTotal = res.data.total || res.data.data.length;
        const limit = res.data.limit || 10;
        setTotalPages(Math.ceil(finalTotal / limit) || 1);
      }

      setArticles(finalArticles);
      setTotalItems(finalTotal);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching articles:", err);
      setError("Failed to fetch articles. Please try again later.");
      setArticles([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory]);

  // Reset page ke 1 ketika search atau category berubah
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch all categories by setting a high limit or using a specific endpoint
        const res = await axios.get<{ data: Category[]; totalData?: number }>(
          "/categories?limit=100"
        );
        console.log("Categories Response:", res.data); // Debugging

        // If the API still returns paginated data and we need more categories
        if (res.data.totalData && res.data.totalData > res.data.data.length) {
          // Fetch all categories by making multiple requests if needed
          const allCategories: Category[] = [...res.data.data];
          const totalPages = Math.ceil(res.data.totalData / 100);

          // Fetch remaining pages if there are more
          for (let page = 2; page <= totalPages; page++) {
            try {
              const pageRes = await axios.get<{ data: Category[] }>(
                `/categories?limit=100&page=${page}`
              );
              allCategories.push(...pageRes.data.data);
            } catch (err) {
              console.error(`Error fetching categories page ${page}:`, err);
            }
          }

          setCategories(allCategories);
          console.log(`Loaded ${allCategories.length} total categories`);
        } else {
          setCategories(res.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        // Try alternative approach if the above fails
        try {
          // Try without limit parameter
          const fallbackRes = await axios.get<{ data: Category[] }>(
            "/categories"
          );
          setCategories(fallbackRes.data.data || []);
        } catch (fallbackErr) {
          console.error("Fallback categories fetch also failed:", fallbackErr);
          setCategories([]);
        }
      }
    };
    fetchCategories();
  }, []);

  // Handler untuk search dengan reset page
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset ke halaman pertama saat search
  };

  // Handler untuk category change dengan reset page
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1); // Reset ke halaman pertama saat filter category
  };

  // Handler untuk clear filters
  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setPage(1);
  };

  // Handler untuk membuka modal delete
  const handleDeleteClick = (article: Article) => {
    setDeleteModal({
      isOpen: true,
      article,
      isDeleting: false,
    });
  };

  // Handler untuk menutup modal delete
  const handleDeleteModalClose = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        article: null,
        isDeleting: false,
      });
    }
  };

  // Handler untuk konfirmasi delete
  const handleDeleteConfirm = async () => {
    if (!deleteModal.article) return;

    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      await axios.delete(`/articles/${deleteModal.article.id}`);

      // Refresh data setelah delete
      await fetchArticles();

      // Tutup modal
      setDeleteModal({
        isOpen: false,
        article: null,
        isDeleting: false,
      });

      // Tampilkan notifikasi sukses
      setNotification({
        isVisible: true,
        type: "success",
        message: `Article "${deleteModal.article.title}" has been deleted successfully.`,
      });
    } catch (err: any) {
      console.error("Error deleting article:", err);

      // Tutup modal
      setDeleteModal({
        isOpen: false,
        article: null,
        isDeleting: false,
      });

      // Tampilkan notifikasi error
      setNotification({
        isVisible: true,
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to delete article. Please try again.",
      });
    }
  };

  // Handler untuk menutup notifikasi
  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  return (
    <div className="p-6">
      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={handleNotificationClose}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Delete Article"
        itemName={deleteModal.article?.title || ""}
        message="This action cannot be undone. The article will be permanently deleted."
        isDeleting={deleteModal.isDeleting}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
            <p className="text-gray-600 mt-2">
              {totalItems > 0 ? (
                <>
                  Showing {(page - 1) * 10 + 1} -{" "}
                  {Math.min(page * 10, totalItems)} of {totalItems} articles
                  {search && ` (filtered by "${search}")`}
                  {selectedCategory && ` (category filtered)`}
                </>
              ) : (
                "No articles found"
              )}
            </p>
          </div>
          <Link
            href="/admin/articles/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Article
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="w-full sm:w-80">
            <DebouncedInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Search articles by title..."
              debounceMs={300}
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear filters button */}
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

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading articles...</p>
        </div>
      )}

      {/* Articles Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {search || selectedCategory
                  ? "No articles found matching your criteria."
                  : "No articles found."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Article
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {articles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-20">
                              <img
                                className="h-16 w-20 rounded-lg object-cover"
                                src={
                                  article.imageUrl ||
                                  "https://picsum.photos/200"
                                }
                                alt={article.title}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                {article.title}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {createExcerpt(article.content)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {article.category.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {article.user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(article.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/articles/${article.id}`}
                              className="text-indigo-600 hover:text-indigo-900 p-2 rounded-md hover:bg-indigo-50"
                              target="_blank"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/admin/articles/edit/${article.id}`}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(article)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="border-b border-gray-200 p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        className="h-16 w-20 rounded-lg object-cover flex-shrink-0"
                        src={article.imageUrl || "https://picsum.photos/200"}
                        alt={article.title}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {createExcerpt(article.content)}
                        </p>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {article.category.name}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(article.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Link
                              href={`/articles/${article.id}`}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                              target="_blank"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/admin/articles/edit/${article.id}`}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(article)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && articles.length > 0 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
      )}
    </div>
  );
}
