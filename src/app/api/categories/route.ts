import { NextRequest, NextResponse } from "next/server";
import { dummyCategories } from "@/lib/dummyData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("q") || searchParams.get("search") || ""; // Support both 'q' and 'search'
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log("GET /api/categories - Query params:", { page, search, limit });

    const start = (page - 1) * limit;
    const end = start + limit;

    let filteredCategories = dummyCategories;

    if (search.trim()) {
      filteredCategories = filteredCategories.filter((category) =>
        category.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const categories = filteredCategories.slice(start, end);
    const total = filteredCategories.length;
    const totalPages = Math.ceil(total / limit);

    console.log("Categories response:", {
      categoriesCount: categories.length,
      total,
      totalPages,
      page,
    });

    // Return data in the format expected by the frontend
    return NextResponse.json(
      {
        data: categories, // Use 'data' key to match frontend expectations
        categories: categories, // Also provide 'categories' for compatibility
        total,
        totalPages,
        page,
        limit,
      },
      {
        headers: {
          "X-Total-Count": total.toString(), // Also provide total in headers
        },
      }
    );
  } catch (error) {
    console.error("Error in GET /api/categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("POST /api/categories - Data received:", data);

    // Validate required fields
    if (!data.name || data.name.trim() === "") {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category with same name already exists
    const existingCategory = dummyCategories.find(
      (c) => c.name.toLowerCase() === data.name.toLowerCase()
    );

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      );
    }

    // Create new category with proper ID generation
    const maxId = Math.max(...dummyCategories.map((c) => c.id), 0);
    const newCategory = {
      id: maxId + 1,
      name: data.name.trim(),
      description: data.description?.trim() || "",
      userId: data.userId || "user-1", // Default user ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dummyCategories.push(newCategory);

    console.log("Category created:", newCategory);

    return NextResponse.json(
      {
        message: "Category created successfully",
        category: newCategory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
