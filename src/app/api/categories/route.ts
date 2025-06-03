import { NextRequest, NextResponse } from "next/server";
import { dummyCategories } from "@/lib/dummyData";
import { v4 as uuidv4 } from "uuid"; // Untuk menghasilkan UUID

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: dummyCategories,
      message: "Kategori berhasil diambil",
    });
  } catch (error) {
    console.error("Error di GET /api/categories:", error);
    return NextResponse.json({ error: "Kesalahan server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Validasi input
    if (!data.name || data.name.trim() === "") {
      return NextResponse.json(
        { error: "Nama kategori harus diisi" },
        { status: 400 }
      );
    }

    // Cek apakah nama kategori sudah ada
    const existingCategory = dummyCategories.find(
      (c) => c.name.toLowerCase() === data.name.toLowerCase()
    );
    if (existingCategory) {
      return NextResponse.json(
        { error: "Kategori dengan nama ini sudah ada" },
        { status: 409 }
      );
    }

    // Buat kategori baru dengan id bertipe string (UUID)
    const newCategory = {
      id: uuidv4(), // Menghasilkan UUID sebagai string
      userId: data.userId || "96c0157e-a321-4bb4-b1aa-12c791787f71", // Default userId dari dummyData
      name: data.name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dummyCategories.push(newCategory);

    return NextResponse.json({
      success: true,
      data: newCategory,
      message: "Kategori berhasil dibuat",
    });
  } catch (error) {
    console.error("Error di POST /api/categories:", error);
    return NextResponse.json({ error: "Kesalahan server" }, { status: 500 });
  }
}
