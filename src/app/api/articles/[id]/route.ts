import { NextRequest, NextResponse } from "next/server";
import { dummyArticles } from "@/lib/dummyData";

// Mendefinisikan tipe untuk params
interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // Mengambil id dari params (berupa Promise)
    const { id } = await params;

    // Tidak perlu parseInt karena id di dummyArticles adalah string
    const article = dummyArticles.find((a) => a.id === id);
    if (!article) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error di GET /api/articles/[id]:", error);
    return NextResponse.json({ error: "Kesalahan server" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    // Mengambil id dari params
    const { id } = await params;

    // Tidak perlu parseInt karena id di dummyArticles adalah string
    const data = await req.json();
    const index = dummyArticles.findIndex((a) => a.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    // Memperbarui artikel dengan data baru
    dummyArticles[index] = {
      ...dummyArticles[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({
      message: "Artikel berhasil diperbarui",
      article: dummyArticles[index],
    });
  } catch (error) {
    console.error("Error di PUT /api/articles/[id]:", error); // Perbaikan sintaks
    return NextResponse.json({ error: "Kesalahan server" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    // Mengambil id dari params
    const { id } = await params;

    // Tidak perlu parseInt karena id di dummyArticles adalah string
    const index = dummyArticles.findIndex((a) => a.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    // Menyimpan artikel yang dihapus untuk respons
    const deletedArticle = dummyArticles.splice(index, 1)[0];
    return NextResponse.json({
      message: "Artikel berhasil dihapus",
      deletedArticle,
    });
  } catch (error) {
    console.error("Error di DELETE /api/articles/[id]:", error);
    return NextResponse.json({ error: "Kesalahan server" }, { status: 500 });
  }
}
