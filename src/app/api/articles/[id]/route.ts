import { NextRequest, NextResponse } from "next/server";
import { dummyArticles } from "@/lib/dummyData";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const article = dummyArticles.find((a) => a.id === parseInt(params.id));
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }
  return NextResponse.json(article);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await req.json();
  const index = dummyArticles.findIndex((a) => a.id === parseInt(params.id));
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
  { params }: { params: { id: string } }
) {
  const index = dummyArticles.findIndex((a) => a.id === parseInt(params.id));
  if (index === -1) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }
  dummyArticles.splice(index, 1);
  return NextResponse.json({ message: "Article deleted" });
}
