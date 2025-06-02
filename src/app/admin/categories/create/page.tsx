"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "@/lib/axios";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

// Define the schema for category form
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

type CategoryForm = z.infer<typeof categorySchema>;

// Notification Component
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

export default function CreateCategoryPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    type: "success" | "error";
    message: string;
  }>({
    isVisible: false,
    type: "success",
    message: "",
  });

  const onSubmit = async (data: CategoryForm) => {
    if (isLoading) return;

    setIsLoading(true);
    setNotification({ isVisible: false, type: "error", message: "" });

    try {
      const payload = {
        name: data.name.trim(),
      };

      console.log("Submitting category data:", payload);

      await axios.post("/categories", payload);

      setNotification({
        isVisible: true,
        type: "success",
        message: `Category "${data.name}" created successfully!`,
      });

      setTimeout(() => {
        router.push("/admin/categories");
        router.refresh();
      }, 1000); // Delay redirect to show success notification
    } catch (error: any) {
      console.error("Error creating category:", error);
      setNotification({
        isVisible: true,
        type: "error",
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create category. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/admin/categories");
  };

  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={handleNotificationClose}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Category</h1>
        <button
          onClick={handleBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          disabled={isLoading}
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name")}
            placeholder="Enter category name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            className="flex-1 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  );
}
