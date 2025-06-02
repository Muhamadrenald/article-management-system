"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit3, Trash2, Eye } from "lucide-react";
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
      params.append("page", page.toString());
      params.append("limit", "10"); // 10 artikel per halaman
      if (search) params.append("search", search);
      if (selectedCategory) params.append("category", selectedCategory);

      const res = await axios.get<PaginatedResponse<Article>>(
        `/articles?${params.toString()}&admin=true`
      );

      console.log("API Response:", res.data); // Debugging respons API

      // Validasi respons
      if (!res.data || !Array.isArray(res.data.data)) {
        throw new Error("Invalid API response structure");
      }

      // Set data artikel
      setArticles(res.data.data);

      // Set totalItems dan totalPages
      const total = res.data.total || res.data.data.length;
      const limit = res.data.limit || 10;
      setTotalItems(total);
      setTotalPages(Math.ceil(total / limit) || 1);

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

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get<{ data: Category[] }>("/categories");
        console.log("Categories Response:", res.data); // Debugging
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

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

      // Update state articles
      setArticles(
        articles.filter((article) => article.id !== deleteModal.article!.id)
      );
      setTotalItems((prev) => {
        const newTotal = prev - 1;
        setTotalPages(Math.ceil(newTotal / 10) || 1);
        return newTotal;
      });

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
            <p className="text-gray-600 mt-2">Total Articles: {totalItems}</p>
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
              onChange={setSearch}
              placeholder="Search articles by title..."
              debounceMs={300}
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
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
              <p className="text-gray-500 text-lg">No articles found.</p>
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
                                  "https://picsum.photos/200" ||
                                  "/placeholder.svg"
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
