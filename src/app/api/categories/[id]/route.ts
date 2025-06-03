import { NextRequest, NextResponse } from "next/server";
import { dummyCategories } from "@/lib/dummyData";

// Mendefinisikan tipe untuk params
interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    console.log("PUT /api/categories/[id] - Category ID:", id);

    const data = await req.json();
    console.log("Update data received:", data);

    const categoryIndex = dummyCategories.findIndex((c) => c.id === id);

    if (categoryIndex === -1) {
      console.log("Category not found for update with ID:", id);
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    if (data.name && data.name.trim() === "") {
      return NextResponse.json(
        { error: "Nama kategori tidak boleh kosong" },
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
          { error: "Kategori dengan nama ini sudah ada" },
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
      message: "Kategori berhasil diperbarui",
      category: dummyCategories[categoryIndex],
    });
  } catch (error) {
    console.error("Error di PUT /api/categories/[id]:", error);
    return NextResponse.json({ error: "Kesalahan server" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    console.log("DELETE /api/categories/[id] - Category ID:", id);

    const categoryIndex = dummyCategories.findIndex((c) => c.id === id);

    if (categoryIndex === -1) {
      console.log("Category not found for deletion with ID:", id);
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    const deletedCategory = dummyCategories.splice(categoryIndex, 1)[0];

    console.log("Category deleted:", deletedCategory);

    return NextResponse.json({
      message: "Kategori berhasil dihapus",
      deletedCategory,
    });
  } catch (error) {
    console.error("Error di DELETE /api/categories/[id]:", error);
    return NextResponse.json({ error: "Kesalahan server" }, { status: 500 });
  }
}
