import { NextRequest, NextResponse } from "next/server";
import { dummyCategories } from "@/lib/dummyData";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const categoryIdParam = resolvedParams.id;

    console.log(
      "PUT /api/categories/[id] - Category ID param:",
      categoryIdParam
    );

    const data = await req.json();
    console.log("Update data received:", data);

    let categoryIndex = dummyCategories.findIndex(
      (c) => c.id.toString() === categoryIdParam
    );

    if (categoryIndex === -1) {
      const categoryIdNum = parseInt(categoryIdParam);
      if (!isNaN(categoryIdNum)) {
        categoryIndex = dummyCategories.findIndex(
          (c) => c.id === categoryIdNum
        );
      }
    }

    if (categoryIndex === -1) {
      console.log("Category not found for update with ID:", categoryIdParam);
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (data.name && data.name.trim() === "") {
      return NextResponse.json(
        { error: "Category name cannot be empty" },
        { status: 400 }
      );
    }

    if (data.name) {
      const existingCategory = dummyCategories.find(
        (c, index) =>
          index !== categoryIndex &&
          c.name.toLowerCase() === data.name.toLowerCase()
      );

      if (existingCategory) {
        return NextResponse.json(
          { error: "Category with this name already exists" },
          { status: 409 }
        );
      }
    }

    dummyCategories[categoryIndex] = {
      ...dummyCategories[categoryIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    console.log("Category updated:", dummyCategories[categoryIndex]);

    return NextResponse.json({
      message: "Category updated successfully",
      category: dummyCategories[categoryIndex],
    });
  } catch (error) {
    console.error("Error in PUT /api/categories/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const categoryIdParam = resolvedParams.id;

    console.log(
      "DELETE /api/categories/[id] - Category ID param:",
      categoryIdParam
    );

    let categoryIndex = dummyCategories.findIndex(
      (c) => c.id.toString() === categoryIdParam
    );

    if (categoryIndex === -1) {
      const categoryIdNum = parseInt(categoryIdParam);
      if (!isNaN(categoryIdNum)) {
        categoryIndex = dummyCategories.findIndex(
          (c) => c.id === categoryIdNum
        );
      }
    }

    if (categoryIndex === -1) {
      console.log("Category not found for deletion with ID:", categoryIdParam);
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const deletedCategory = dummyCategories[categoryIndex];
    dummyCategories.splice(categoryIndex, 1);

    console.log("Category deleted:", deletedCategory);

    return NextResponse.json({
      message: "Category deleted successfully",
      deletedCategory,
    });
  } catch (error) {
    console.error("Error in DELETE /api/categories/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
