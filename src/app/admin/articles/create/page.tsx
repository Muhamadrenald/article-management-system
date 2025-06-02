"use client";

import type React from "react";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "@/lib/axios";
import { useState, useEffect } from "react";
import { Notification } from "@/components/ui/notification";

// Define the category type for better type safety
interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Zod schema for form validation
const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
});

type ArticleForm = z.infer<typeof articleSchema>;

export default function CreateArticlePage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ArticleForm>({
    resolver: zodResolver(articleSchema),
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [preview, setPreview] = useState<ArticleForm | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    const fetchCategories = async () => {
      setIsLoading(true);
      setNotification({ isVisible: false, type: "error", message: "" });
      try {
        // Fetch all categories by setting a high limit or using 'all' parameter
        const res = await axios.get("/categories?limit=1000"); // Set high limit to get all categories
        console.log("API Response (Categories):", res.data);

        // Handle different response structures
        let fetchedCategories = [];
        if (Array.isArray(res.data)) {
          fetchedCategories = res.data;
        } else if (Array.isArray(res.data.data)) {
          fetchedCategories = res.data.data;
        } else if (Array.isArray(res.data.categories)) {
          fetchedCategories = res.data.categories;
        } else {
          console.warn("Unexpected response structure:", res.data);
          fetchedCategories = [];
        }

        // If we still don't have all categories, fetch them page by page
        if (
          res.data.totalData &&
          fetchedCategories.length < res.data.totalData
        ) {
          console.log("Fetching remaining categories...");
          const totalPages =
            res.data.totalPages || Math.ceil(res.data.totalData / 10);
          const allCategories = [...fetchedCategories];

          // Fetch remaining pages
          for (let page = 2; page <= totalPages; page++) {
            try {
              const pageRes = await axios.get(
                `/categories?page=${page}&limit=10`
              );
              const pageCategories = Array.isArray(pageRes.data)
                ? pageRes.data
                : Array.isArray(pageRes.data.data)
                ? pageRes.data.data
                : Array.isArray(pageRes.data.categories)
                ? pageRes.data.categories
                : [];

              allCategories.push(...pageCategories);
            } catch (pageError) {
              console.error(`Error fetching page ${page}:`, pageError);
            }
          }
          fetchedCategories = allCategories;
        }

        const validCategories = fetchedCategories.filter(
          (cat: any) => cat && cat.id && cat.id.trim() !== "" && cat.name
        );

        console.log(
          `Loaded ${validCategories.length} categories out of ${
            res.data.totalData || "unknown"
          } total`
        );
        setCategories(validCategories);

        if (validCategories.length === 0) {
          setNotification({
            isVisible: true,
            type: "error",
            message: "No categories available. Please create a category first.",
          });
        }
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        if (err.response?.status === 401) {
          setNotification({
            isVisible: true,
            type: "error",
            message: "Session expired. Please log in again.",
          });
        } else {
          setNotification({
            isVisible: true,
            type: "error",
            message:
              err.response?.data?.message || "Failed to fetch categories",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          isVisible: true,
          type: "error",
          message: "File size too large. Maximum 5MB.",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setNotification({
          isVisible: true,
          type: "error",
          message: "File must be an image.",
        });
        return;
      }

      setImageFile(file);
      setNotification({ isVisible: false, type: "error", message: "" });

      // Create preview URL - cleanup previous URL first
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
      console.error("Error response:", err.response?.data);
      if (err.response?.status === 401) {
        throw new Error("Session expired. Please log in again.");
      } else if (err.response?.status === 413) {
        throw new Error("File too large to upload.");
      } else if (err.response?.status === 400) {
        throw new Error("Unsupported file format or invalid data.");
      } else {
        throw new Error(
          err.response?.data?.message || "Failed to upload image"
        );
      }
    }
  };

  const onSubmit = async (data: ArticleForm) => {
    setIsLoading(true);
    setNotification({ isVisible: false, type: "error", message: "" });

    try {
      let finalData = { ...data };

      if (imageFile) {
        try {
          console.log(
            "Uploading image file:",
            imageFile.name,
            imageFile.size,
            imageFile.type
          );
          const imageUrl = await uploadImage(imageFile);
          console.log("Image uploaded successfully:", imageUrl);
          finalData = { ...data, imageUrl };
          setValue("imageUrl", imageUrl);
        } catch (uploadError: any) {
          console.error("Image upload failed:", uploadError);
          setNotification({
            isVisible: true,
            type: "error",
            message: uploadError.message,
          });
          setIsLoading(false);
          return;
        }
      }

      console.log("Final data to be sent to /articles:", finalData);

      const articlePayload = {
        title: finalData.title?.trim(),
        content: finalData.content?.trim(),
        categoryId: finalData.categoryId,
        ...(finalData.imageUrl && { imageUrl: finalData.imageUrl }),
      };

      console.log("Article payload:", articlePayload);

      if (
        !articlePayload.title ||
        !articlePayload.content ||
        !articlePayload.categoryId
      ) {
        throw new Error(
          "Incomplete data: Title, content, and category are required"
        );
      }

      const response = await axios.post("/articles", articlePayload);
      console.log("Article created successfully:", response.data);

      setNotification({
        isVisible: true,
        type: "success",
        message: "Article created successfully!",
      });

      setTimeout(() => {
        router.push("/admin/articles");
      }, 1000); // Delay redirect to show success notification
    } catch (error: any) {
      console.error("Error creating article:", error);
      console.error("Error response data:", error.response?.data);

      if (error.response?.status === 401) {
        setNotification({
          isVisible: true,
          type: "error",
          message: "Session expired. Please log in again.",
        });
      } else if (error.response?.status === 400) {
        const errorData = error.response?.data;
        if (errorData?.error?.includes("prisma.article.create")) {
          setNotification({
            isVisible: true,
            type: "error",
            message:
              "Invalid article data. Ensure all fields are correct (title, content, category, and image URL if provided).",
          });
        } else if (errorData?.message) {
          setNotification({
            isVisible: true,
            type: "error",
            message: `Validation failed: ${errorData.message}`,
          });
        } else if (errorData?.errors) {
          const errorMessages = Array.isArray(errorData.errors)
            ? errorData.errors.join(", ")
            : JSON.stringify(errorData.errors);
          setNotification({
            isVisible: true,
            type: "error",
            message: `Validation failed: ${errorMessages}`,
          });
        } else {
          setNotification({
            isVisible: true,
            type: "error",
            message: "Invalid data. Please check all required fields.",
          });
        }
      } else {
        setNotification({
          isVisible: true,
          type: "error",
          message:
            error.response?.data?.message ||
            error.message ||
            "Failed to create article",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onPreview = async (data: ArticleForm) => {
    setNotification({ isVisible: false, type: "error", message: "" });

    // Validate required fields
    if (!data.title || !data.content || !data.categoryId) {
      setNotification({
        isVisible: true,
        type: "error",
        message:
          "Please fill in all required fields (title, content, category) to preview.",
      });
      return;
    }

    let previewData = { ...data };

    if (imageFile) {
      try {
        console.log("Uploading image for preview:", imageFile.name);
        const imageUrl = await uploadImage(imageFile);
        console.log("Preview image uploaded:", imageUrl);
        previewData = { ...data, imageUrl };
      } catch (err: any) {
        console.error("Preview image upload failed:", err);
        setNotification({
          isVisible: true,
          type: "error",
          message: err.message || "Failed to upload image for preview",
        });
        return;
      }
    }
    setPreview(previewData);
  };

  const handleBack = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    router.push("/admin/articles");
  };

  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={handleNotificationClose}
      />

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Create Article</h1>
        <button
          onClick={handleBack}
          className="p-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register("title")}
            placeholder="Article Title"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <textarea
            {...register("content")}
            placeholder="Article Content"
            className="w-full p-2 border rounded h-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">
              {errors.content.message}
            </p>
          )}
        </div>

        <div>
          <select
            {...register("categoryId")}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">Select Category</option>
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
          {isLoading && (
            <p className="text-gray-500 text-sm mt-1">Loading categories...</p>
          )}
          {!isLoading && categories.length === 0 && (
            <p className="text-red-500 text-sm mt-1">No categories available</p>
          )}
          {!isLoading && categories.length > 0 && (
            <p className="text-gray-500 text-sm mt-1">
              {categories.length} categories loaded
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: JPG, PNG, GIF. Max 5MB.
          </p>
          {imagePreviewUrl && (
            <div className="mt-2">
              <img
                src={imagePreviewUrl || "/placeholder.svg"}
                alt="Image Preview"
                className="max-w-xs max-h-48 object-cover rounded border"
              />
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleSubmit(onPreview)}
            className="w-full p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Preview"}
          </button>
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>

      {preview && (
        <div className="mt-8 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Article Preview</h2>
          <div className="bg-white p-4 rounded border">
            <h3 className="text-lg font-bold mb-2">{preview.title}</h3>
            <p className="text-gray-600 mb-4">
              Category:{" "}
              {categories.find((c) => c.id === preview.categoryId)?.name ||
                "Unknown"}
            </p>
            {preview.imageUrl && (
              <div className="mb-4">
                <img
                  src={preview.imageUrl || "/placeholder.svg"}
                  alt="Article Image"
                  className="max-w-md max-h-64 object-cover rounded border"
                />
              </div>
            )}
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{preview.content}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
