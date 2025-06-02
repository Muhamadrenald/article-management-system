import { NextRequest, NextResponse } from "next/server";
import { dummyArticles, dummyCategories } from "@/lib/dummyData";

export async function GET(req: NextRequest) {
  const { searchParams, pathname } = new URL(req.url);
  const id = pathname.match(/\/api\/articles\/([^/]+)/)?.[1]; // Ambil ID dari pathname

  if (id) {
    const article = dummyArticles.find((a) => a.id === id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    const category = dummyCategories.find((c) => c.id === article.categoryId);
    return NextResponse.json({
      id: article.id,
      title: article.title,
      content: article.content,
      imageUrl: article.imageUrl,
      categoryId: article.categoryId,
      user: article.user,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      category: category || null,
    });
  }

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search")?.trim().toLowerCase() || "";
  const categoryId = searchParams.get("category") || "";
  const isAdmin = searchParams.get("admin") === "true";
  const limit = isAdmin ? 10 : 9;
  const start = (page - 1) * limit;
  const end = start + limit;

  let filteredArticles = [...dummyArticles];

  if (categoryId && !dummyCategories.find((c) => c.id === categoryId)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 404 });
  }

  if (search) {
    const matchingCategories = dummyCategories.filter((category) =>
      category.name.toLowerCase().includes(search)
    );
    const matchingCategoryIds = matchingCategories.map(
      (category) => category.id
    );

    filteredArticles = filteredArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(search) ||
        matchingCategoryIds.includes(article.categoryId)
    );
  }

  if (categoryId) {
    filteredArticles = filteredArticles.filter(
      (article) => article.categoryId === categoryId
    );
  }

  const articles = filteredArticles.slice(start, end).map((article) => {
    const category = dummyCategories.find((c) => c.id === article.categoryId);
    return { ...article, category: category || null };
  });

  return NextResponse.json({
    data: articles,
    total: filteredArticles.length,
    page,
    limit,
  });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newArticle = { id: crypto.randomUUID(), ...data };
  dummyArticles.push(newArticle);
  return NextResponse.json({ message: "Article created", article: newArticle });
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "";
  const data = await req.json();
  const index = dummyArticles.findIndex((a) => a.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }
  dummyArticles[index] = { ...dummyArticles[index], ...data };
  return NextResponse.json({
    message: "Article updated",
    article: dummyArticles[index],
  });
}
