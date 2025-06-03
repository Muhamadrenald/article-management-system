"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "@/lib/axios";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

type CategoryForm = z.infer<typeof categorySchema>;

interface Category {
  id: string | number;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationProps {
  type: "success" | "error";
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

// Interface untuk PageProps sesuai dengan Next.js 15
interface PageProps {
  params: Promise<{ id: string }>;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  isVisible,
  onClose,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div
        className={`p-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm ${
          type === "success"
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }`}
      >
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded-full hover:bg-opacity-20 ${
            type === "success" ? "hover:bg-green-600" : "hover:bg-red-600"
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function EditCategoryPage({ params }: PageProps) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // Resolve params Promise untuk Next.js 15
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolved = await params;
        setCategoryId(resolved.id);
      } catch (error) {
        console.error("Error resolving params:", error);
        setErrorMessage("Failed to load category ID");
        setNotification({
          isVisible: true,
          type: "error",
          message: "Failed to load category ID",
        });
      }
    };
    resolveParams();
  }, [params]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const [preview, setPreview] = useState<CategoryForm | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    type: "success" | "error";
    message: string;
  }>({
    isVisible: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) {
        setErrorMessage("Category ID not found.");
        setNotification({
          isVisible: true,
          type: "error",
          message: "Category ID not found.",
        });
        setTimeout(() => {
          router.push("/admin/categories?error=invalid-id");
        }, 1000);
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      try {
        console.log("Fetching all categories for ID:", categoryId);
        let allCategories: Category[] = [];
        let page = 1;
        let totalPages = 1;

        while (page <= totalPages) {
          const res = await axios.get(`/categories?page=${page}&limit=100`);
          console.log(`Category response for page ${page}:`, res.data);

          let categories: Category[] = [];
          if (Array.isArray(res.data)) {
            categories = res.data;
          } else if (res.data.data && Array.isArray(res.data.data)) {
            categories = res.data.data;
          } else if (
            res.data.categories &&
            Array.isArray(res.data.categories)
          ) {
            categories = res.data.categories;
          } else {
            throw new Error("Invalid API response structure");
          }

          allCategories = [...allCategories, ...categories];
          totalPages = res.data.totalPages || 1;
          page++;
        }

        const category = allCategories.find(
          (c: Category) => c.id.toString() === categoryId.toString()
        );

        if (!category || !category.name) {
          throw new Error("Category not found or data is invalid");
        }

        setValue("name", category.name);
        console.log("Category data loaded:", category);
      } catch (error: any) {
        console.error("Error fetching category:", error);
        const errorMsg =
          error.response?.data?.error ||
          error.message ||
          `Failed to fetch category (Status: ${
            error.response?.status || "Unknown"
          })`;
        setErrorMessage(errorMsg);
        setNotification({
          isVisible: true,
          type: "error",
          message: errorMsg,
        });
        setTimeout(() => {
          router.push("/admin/categories?error=fetch-failed");
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId, setValue, router]);

  const onSubmit = async (data: CategoryForm) => {
    if (submitting || !categoryId) return;

    try {
      setSubmitting(true);
      setErrorMessage(null);
      setNotification({ isVisible: false, type: "error", message: "" });

      console.log("Sending update data:", data);
      console.log("Category ID:", categoryId);

      const payload = {
        name: data.name.trim(),
      };

      const res = await axios.put(`/categories/${categoryId}`, payload);
      console.log("Category update response:", res.data);

      setNotification({
        isVisible: true,
        type: "success",
        message: "Category updated successfully!",
      });

      setTimeout(() => {
        router.push("/admin/categories");
        router.refresh();
      }, 1500);
    } catch (error: any) {
      console.error("Error updating category:", error);
      let errorMsg = "Failed to update category";

      if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      } else if (error.response?.status) {
        errorMsg = `Failed to update category (Status: ${error.response.status})`;
      }

      setErrorMessage(errorMsg);
      setNotification({
        isVisible: true,
        type: "error",
        message: errorMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onPreview = (data: CategoryForm) => {
    console.log("Preview data:", data);
    setPreview(data);
  };

  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={handleNotificationClose}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Category</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          disabled={submitting}
        >
          ← Back
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name")}
            placeholder="Enter category name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={submitting}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={handleSubmit(onPreview)}
            className="flex-1 p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            Preview
          </button>
          <button
            type="submit"
            className="flex-1 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </span>
            ) : (
              "Update Category"
            )}
          </button>
        </div>
      </form>

      {preview && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Preview</h2>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-2xl font-bold mb-3 text-gray-900">
              {preview.name}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
