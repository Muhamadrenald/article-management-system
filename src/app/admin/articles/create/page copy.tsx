"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "@/lib/axios";
import { useState, useEffect } from "react";

// Define the category type for better type safety
interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Zod schema for form validation - PERBAIKAN: Ubah 'image' menjadi 'imageUrl'
const articleSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  content: z.string().min(1, "Konten wajib diisi"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  imageUrl: z.string().optional(), // PERBAIKAN: Gunakan 'imageUrl' sesuai backend
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await axios.get("/categories", {
          headers: getAuthHeaders(),
        });
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

        const validCategories = fetchedCategories.filter(
          (cat: any) => cat && cat.id && cat.id.trim() !== "" && cat.name
        );

        console.log("Valid Categories:", validCategories);
        setCategories(validCategories);

        if (validCategories.length === 0) {
          setErrorMessage(
            "Tidak ada kategori tersedia. Silakan buat kategori terlebih dahulu."
          );
        }
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        if (err.response?.status === 401) {
          setErrorMessage("Sesi telah berakhir. Silakan login kembali.");
        } else {
          setErrorMessage(
            err.response?.data?.message || "Gagal mengambil kategori"
          );
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
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Ukuran file terlalu besar. Maksimal 5MB.");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrorMessage("File harus berupa gambar.");
        return;
      }

      setImageFile(file);
      setErrorMessage(null);

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

  // PERBAIKAN: Ubah return type menjadi imageUrl
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("/upload", formData, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      console.log("Upload Response:", res.data);

      // PERBAIKAN: Handle response sesuai dengan actual API response
      let imageUrl = "";
      if (res.data.imageUrl) {
        imageUrl = res.data.imageUrl;
      } else if (res.data.image) {
        imageUrl = res.data.image;
      } else if (res.data.url) {
        imageUrl = res.data.url;
      } else if (res.data.data?.image) {
        imageUrl = res.data.data.image;
      } else if (res.data.data?.url) {
        imageUrl = res.data.data.url;
      } else {
        console.error("Unexpected response structure:", res.data);
        throw new Error("URL gambar tidak ditemukan dalam respons");
      }

      return imageUrl;
    } catch (err: any) {
      console.error("Error uploading image:", err);
      console.error("Error response:", err.response?.data);

      if (err.response?.status === 401) {
        throw new Error("Sesi telah berakhir. Silakan login kembali.");
      } else if (err.response?.status === 413) {
        throw new Error("File terlalu besar untuk diunggah.");
      } else if (err.response?.status === 400) {
        throw new Error("Format file tidak didukung atau data tidak valid.");
      } else {
        throw new Error(
          err.response?.data?.message ||
            err.message ||
            "Gagal mengunggah gambar"
        );
      }
    }
  };

  const onSubmit = async (data: ArticleForm) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let finalData = { ...data };

      console.log("Form data before image upload:", data);

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
          // PERBAIKAN: Set imageUrl bukan image
          finalData = { ...data, imageUrl };
          setValue("imageUrl", imageUrl);
        } catch (uploadError: any) {
          console.error("Image upload failed:", uploadError);
          setErrorMessage(uploadError.message);
          setIsLoading(false);
          return;
        }
      }

      console.log("Final data to be sent to /articles:", finalData);

      // PERBAIKAN: Pastikan menggunakan 'imageUrl' sesuai dengan backend schema
      const articlePayload = {
        title: finalData.title?.trim(),
        content: finalData.content?.trim(),
        categoryId: finalData.categoryId,
        ...(finalData.imageUrl && { imageUrl: finalData.imageUrl }), // PERBAIKAN: Gunakan imageUrl
      };

      console.log("Article payload:", articlePayload);

      // Validasi data sebelum kirim
      if (
        !articlePayload.title ||
        !articlePayload.content ||
        !articlePayload.categoryId
      ) {
        throw new Error(
          "Data tidak lengkap: Judul, konten, dan kategori wajib diisi"
        );
      }

      const response = await axios.post("/articles", articlePayload, {
        headers: getAuthHeaders(),
      });

      console.log("Article created successfully:", response.data);
      router.push("/admin/articles");
    } catch (error: any) {
      console.error("Error creating article:", error);
      console.error("Error response data:", error.response?.data);

      if (error.response?.status === 401) {
        setErrorMessage("Sesi telah berakhir. Silakan login kembali.");
      } else if (error.response?.status === 400) {
        const errorData = error.response?.data;
        if (errorData?.message) {
          setErrorMessage(`Validasi gagal: ${errorData.message}`);
        } else if (errorData?.error) {
          // PERBAIKAN: Handle Prisma error messages
          setErrorMessage(`Error database: ${errorData.error}`);
        } else if (errorData?.errors) {
          const errorMessages = Array.isArray(errorData.errors)
            ? errorData.errors.join(", ")
            : JSON.stringify(errorData.errors);
          setErrorMessage(`Validasi gagal: ${errorMessages}`);
        } else {
          setErrorMessage(
            "Data tidak valid. Periksa semua field yang wajib diisi."
          );
        }
      } else {
        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Gagal membuat artikel"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onPreview = async (data: ArticleForm) => {
    let previewData = { ...data };
    setErrorMessage(null);

    console.log("Preview data:", data);

    if (imageFile) {
      try {
        console.log("Uploading image for preview:", imageFile.name);
        const imageUrl = await uploadImage(imageFile);
        console.log("Preview image uploaded:", imageUrl);
        // PERBAIKAN: Set imageUrl untuk preview
        previewData = { ...data, imageUrl };
      } catch (err: any) {
        console.error("Preview image upload failed:", err);
        setErrorMessage(
          err.message || "Gagal mengunggah gambar untuk pratinjau"
        );
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

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Buat Artikel</h1>
        <button
          onClick={handleBack}
          className="p-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
        >
          Kembali
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Debug Panel - Hapus setelah debugging selesai */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <pre className="text-xs overflow-auto max-h-32">
              {JSON.stringify(
                {
                  formValues: {
                    title: register("title").name,
                    content: register("content").name,
                    categoryId: register("categoryId").name,
                  },
                  imageFile: imageFile
                    ? {
                        name: imageFile.name,
                        size: imageFile.size,
                        type: imageFile.type,
                      }
                    : null,
                  categoriesCount: categories.length,
                  errors: errors,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}

        <div>
          <input
            {...register("title")}
            placeholder="Judul Artikel"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <textarea
            {...register("content")}
            placeholder="Konten Artikel"
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
            disabled={isLoading || categories.length === 0}
          >
            <option value="">Pilih Kategori</option>
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
            <p className="text-gray-500 text-sm mt-1">Memuat kategori...</p>
          )}
          {!isLoading && categories.length === 0 && (
            <p className="text-red-500 text-sm mt-1">
              Tidak ada kategori tersedia
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unggah Gambar (Opsional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format yang didukung: JPG, PNG, GIF. Maksimal 5MB.
          </p>
          {imagePreviewUrl && (
            <div className="mt-2">
              <img
                src={imagePreviewUrl}
                alt="Pratinjau Gambar"
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
            {isLoading ? "Memproses..." : "Pratinjau"}
          </button>
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Membuat..." : "Buat"}
          </button>
          {/* Debug button - Hapus setelah debugging selesai */}
          {process.env.NODE_ENV === "development" && (
            <button
              type="button"
              onClick={async () => {
                const formData = {
                  title: "Test Article " + Date.now(),
                  content: "This is a test content for debugging purposes",
                  categoryId: categories[0]?.id || "",
                };
                console.log("Testing with data:", formData);
                try {
                  const response = await axios.post("/articles", formData, {
                    headers: getAuthHeaders(),
                  });
                  console.log("Test success:", response.data);
                  alert("Test berhasil!");
                } catch (error: any) {
                  console.error("Test error:", error.response?.data);
                  alert("Test gagal: " + JSON.stringify(error.response?.data));
                }
              }}
              className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-xs"
              disabled={isLoading || categories.length === 0}
            >
              Test API
            </button>
          )}
        </div>
      </form>

      {preview && (
        <div className="mt-8 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Pratinjau Artikel</h2>
          <div className="bg-white p-4 rounded border">
            <h3 className="text-lg font-bold mb-2">{preview.title}</h3>
            <p className="text-gray-600 mb-4">
              Kategori:{" "}
              {categories.find((c) => c.id === preview.categoryId)?.name ||
                "Tidak Diketahui"}
            </p>
            {/* PERBAIKAN: Use imageUrl instead of image */}
            {preview.imageUrl && (
              <div className="mb-4">
                <img
                  src={preview.imageUrl}
                  alt="Gambar Artikel"
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
