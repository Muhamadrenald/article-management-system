"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit3, Trash2, X } from "lucide-react";
import axios from "@/lib/axios";
import type { Category } from "@/types";
import DebouncedInput from "@/components/DebouncedInput";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Notification } from "@/components/ui/notification";
import { Pagination } from "@/components/ui/pagination";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    category: Category | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    category: null,
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

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("limit", "100");

      // Only add search param if search is not empty
      if (search.trim()) {
        params.append("q", search.trim());
      }

      console.log("Fetching categories with params:", params.toString());

      const res = await axios.get(`/categories?${params.toString()}`);
      console.log("Categories API Response:", res.data);

      let fetchedCategories: Category[] = [];
      let total = 0;

      if (Array.isArray(res.data)) {
        fetchedCategories = res.data;
        total =
          Number.parseInt(res.headers["x-total-count"]) || res.data.length;
      } else if (res.data && Array.isArray(res.data.data)) {
        fetchedCategories = res.data.data;
        total =
          res.data.totalData ||
          res.data.total ||
          Number.parseInt(res.headers["x-total-count"]) ||
          res.data.data.length;
      } else if (res.data && Array.isArray(res.data.categories)) {
        fetchedCategories = res.data.categories;
        total =
          res.data.totalData ||
          res.data.total ||
          Number.parseInt(res.headers["x-total-count"]) ||
          res.data.categories.length;
      } else {
        console.error("Unexpected response structure:", res.data);
        throw new Error("Invalid API response structure");
      }

      // Store all fetched categories for client-side filtering
      setAllCategories(fetchedCategories);

      // Apply client-side filtering if search term exists
      let filteredCategories = fetchedCategories;
      if (search.trim()) {
        const searchLower = search.trim().toLowerCase();
        filteredCategories = fetchedCategories.filter((category) =>
          category.name.toLowerCase().includes(searchLower)
        );
        console.log(
          `Client-side filtering for "${search}" found ${filteredCategories.length} results`
        );
      }

      // Calculate pagination based on filtered results
      const limit = 10;
      const startIndex = (page - 1) * limit;
      const paginatedCategories = filteredCategories.slice(
        startIndex,
        startIndex + limit
      );

      setCategories(paginatedCategories);
      setTotalItems(filteredCategories.length);
      setTotalPages(Math.ceil(filteredCategories.length / limit) || 1);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      const errorMessage =
        err.response?.status === 500
          ? "Server error occurred. Please try again later or contact support."
          : err.response?.data?.message ||
            `Failed to fetch categories: ${err.message || "Unknown error"}`;
      setError(errorMessage);
      setNotification({
        isVisible: true,
        type: "error",
        message: errorMessage,
      });
      setCategories([]);
      setAllCategories([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handler for search with reset page
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch(""); // This will now properly clear the DebouncedInput
    setPage(1);
  };

  const handleDeleteClick = (category: Category) => {
    setDeleteModal({
      isOpen: true,
      category,
      isDeleting: false,
    });
  };

  const handleDeleteModalClose = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        category: null,
        isDeleting: false,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.category) return;

    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      await axios.delete(`/categories/${deleteModal.category.id}`);

      // Refresh data after delete
      await fetchCategories();

      setDeleteModal({
        isOpen: false,
        category: null,
        isDeleting: false,
      });

      setNotification({
        isVisible: true,
        type: "success",
        message: `Category "${deleteModal.category.name}" deleted successfully.`,
      });
    } catch (err: any) {
      console.error("Error deleting category:", err);
      setDeleteModal({
        isOpen: false,
        category: null,
        isDeleting: false,
      });
      setNotification({
        isVisible: true,
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to delete category. It might be used by existing articles.",
      });
    }
  };

  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  return (
    <div className="p-6">
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={handleNotificationClose}
      />

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        itemName={deleteModal.category?.name || ""}
        message="This action cannot be undone. The category will be permanently deleted."
        isDeleting={deleteModal.isDeleting}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-2">
              {totalItems > 0 ? (
                <>
                  Showing {(page - 1) * 10 + 1} -{" "}
                  {Math.min(page * 10, totalItems)} of {totalItems} categories
                  {search && ` (filtered by "${search}")`}
                </>
              ) : (
                "No categories found"
              )}
            </p>
          </div>
          <Link
            href="/admin/categories/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Category
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
        <div className="w-full sm:w-80">
          <DebouncedInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search categories by name..."
            debounceMs={300}
          />
        </div>

        {/* Clear search button */}
        {search && (
          <button
            onClick={handleClearSearch}
            className="ml-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
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
          <p className="mt-2 text-gray-600">Loading categories...</p>
        </div>
      )}

      {/* Categories Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {search
                  ? `No categories found matching "${search}".`
                  : "No categories found."}
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
                        Name
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
                    {categories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/admin/categories/edit/${category.id}`}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(category)}
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
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border-b border-gray-200 p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900">
                          {category.name}
                        </h3>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(category.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Link
                              href={`/admin/categories/edit/${category.id}`}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(category)}
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
      {!loading && categories.length > 0 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
      )}
    </div>
  );
}
