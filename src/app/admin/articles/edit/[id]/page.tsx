"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "@/lib/axios";
import { useState, useEffect, use } from "react";
import { X } from "lucide-react";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
});

type ArticleForm = z.infer<typeof articleSchema>;

interface Article {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  userId?: string;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: string;
  name: string;
}

interface NotificationProps {
  type: "success" | "error";
  message: string;
  isVisible: boolean;
  onClose: () => void;
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
      }, 5000); // Auto close after 5 seconds
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
            : "bg-red-100 border border-red-400 text-red-700"
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

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const articleId = resolvedParams.id;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ArticleForm>({
    resolver: zodResolver(articleSchema),
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [preview, setPreview] = useState<ArticleForm | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
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
    const fetchArticle = async () => {
      try {
        console.log("Fetching article with ID:", articleId);
        const res = await axios.get(`/articles/${articleId}?admin=true`);
        console.log("Article response:", res.data);

        const article: Article = res.data.data || res.data.article || res.data;

        setValue("title", article.title);
        setValue("content", article.content);
        setValue("categoryId", article.categoryId);
        if (article.imageUrl) {
          setValue("imageUrl", article.imageUrl);
          setImagePreviewUrl(article.imageUrl);
        }

        console.log("Article data loaded:", article);
      } catch (error: any) {
        console.error("Error fetching article:", error);
        setErrorMessage(
          error.response?.data?.message ||
            error.response?.data?.error ||
            `Failed to fetch article. Status: ${
              error.response?.status || "Unknown"
            }`
        );
      }
    };

    const fetchCategories = async () => {
      try {
        console.log("Fetching categories...");
        const res = await axios.get("/categories");
        console.log("Categories response:", res.data);

        const categoriesData: Category[] =
          res.data.data || res.data.categories || res.data || [];
        setCategories(categoriesData);
        console.log("Categories loaded:", categoriesData);
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setErrorMessage(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to fetch categories"
        );
      }
    };

    const fetchData = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        await Promise.all([fetchArticle(), fetchCategories()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [articleId, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("File size too large. Maximum 5MB.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrorMessage("File must be an image.");
        return;
      }

      setImageFile(file);
      setErrorMessage(null);

      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }

      const localUrl = URL.createObjectURL(file);
      setImagePreviewUrl(localUrl);
    } else {
      setImageFile(null);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImagePreviewUrl(null);
      setValue("imageUrl", "");
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("/upload", formData);
      console.log("Upload Response:", res.data);

      if (res.data.imageUrl) {
        return res.data.imageUrl;
      } else {
        console.error("Unexpected response structure:", res.data);
        throw new Error("Image URL not found in response");
      }
    } catch (err: any) {
      console.error("Error uploading image:", err);
      throw new Error(err.response?.data?.message || "Failed to upload image");
    }
  };

  const onSubmit = async (data: ArticleForm) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage(null);

      let finalData = { ...data };

      if (imageFile) {
        try {
          const imageUrl = await uploadImage(imageFile);
          finalData = { ...data, imageUrl };
          setValue("imageUrl", imageUrl);
        } catch (uploadError: any) {
          setErrorMessage(uploadError.message);
          setSubmitting(false);
          return;
        }
      }

      console.log("Submitting data:", finalData);

      const response = await axios.put(`/articles/${articleId}`, {
        title: finalData.title,
        content: finalData.content,
        categoryId: finalData.categoryId,
        ...(finalData.imageUrl && { imageUrl: finalData.imageUrl }),
      });

      console.log("Article updated successfully:", response.data);
      setNotification({
        isVisible: true,
        type: "success",
        message: "Article updated successfully!",
      });
      setTimeout(() => {
        router.push("/admin/articles");
        router.refresh();
      }, 1000); // Delay redirect to show success notification
    } catch (error: any) {
      console.error("Error updating article:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          `Failed to update article. Status: ${
            error.response?.status || "Unknown"
          }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onPreview = async (data: ArticleForm) => {
    console.log("Preview data:", data);

    let previewData = { ...data };

    if (imageFile) {
      try {
        const imageUrl = await uploadImage(imageFile);
        previewData = { ...data, imageUrl };
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to upload image for preview");
        return;
      }
    }

    setPreview(previewData);
  };

  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imageFile) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl, imageFile]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="flex space-x-4">
            <div className="flex-1 h-12 bg-gray-200 rounded"></div>
            <div className="flex-1 h-12 bg-gray-200 rounded"></div>
          </div>
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
        <h1 className="text-2xl font-bold">Edit Article</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
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
            Title <span className="text-red-500">*</span>
          </label>
          <input
            {...register("title")}
            placeholder="Enter article title"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={submitting}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("content")}
            placeholder="Enter article content"
            rows={8}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
            disabled={submitting}
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">
              {errors.content.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            {...register("categoryId")}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={submitting}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Article Image (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={submitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: JPG, PNG, GIF. Max 5MB.
          </p>
          {imagePreviewUrl && (
            <div className="mt-2 relative">
              <img
                src={imagePreviewUrl}
                alt="Image Preview"
                className="max-w-xs max-h-48 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  if (imagePreviewUrl) {
                    URL.revokeObjectURL(imagePreviewUrl);
                  }
                  setImagePreviewUrl(null);
                  setValue("imageUrl", "");
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
            {submitting ? "Updating..." : "Update Article"}
          </button>
        </div>
      </form>

      {preview && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Preview</h2>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-2xl font-bold mb-3 text-gray-900">
              {preview.title}
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              <strong>Category:</strong>{" "}
              {categories.find((c) => c.id === preview.categoryId)?.name ||
                "Unknown Category"}
            </p>
            {preview.imageUrl && (
              <div className="mb-4">
                <img
                  src={preview.imageUrl}
                  alt="Article Image"
                  className="max-w-md max-h-64 object-cover rounded border"
                />
              </div>
            )}
            <div className="prose prose-sm max-w-none text-gray-700">
              {preview.content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-3 leading-relaxed">
                  {paragraph || "\u00A0"}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
