import { NextRequest, NextResponse } from "next/server";
import { dummyArticles } from "@/lib/dummyData";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params karena sekarang berupa Promise di Next.js 15
  const { id } = await params;

  // Perbaikan: Konversi id ke number terlebih dahulu
  const articleId = parseInt(id);
  if (isNaN(articleId)) {
    return NextResponse.json({ error: "Invalid article ID" }, { status: 400 });
  }

  const article = dummyArticles.find((a) => a.id === articleId);
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params karena sekarang berupa Promise di Next.js 15
  const { id } = await params;

  // Perbaikan: Konversi id ke number terlebih dahulu
  const articleId = parseInt(id);
  if (isNaN(articleId)) {
    return NextResponse.json({ error: "Invalid article ID" }, { status: 400 });
  }

  const data = await req.json();
  const index = dummyArticles.findIndex((a) => a.id === articleId);

  if (index === -1) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  dummyArticles[index] = { ...dummyArticles[index], ...data };
  return NextResponse.json({
    message: "Article updated",
    article: dummyArticles[index],
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params karena sekarang berupa Promise di Next.js 15
  const { id } = await params;

  // Perbaikan: Konversi id ke number terlebih dahulu
  const articleId = parseInt(id);
  if (isNaN(articleId)) {
    return NextResponse.json({ error: "Invalid article ID" }, { status: 400 });
  }

  const index = dummyArticles.findIndex((a) => a.id === articleId);

  if (index === -1) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  dummyArticles.splice(index, 1);
  return NextResponse.json({ message: "Article deleted" });
}
