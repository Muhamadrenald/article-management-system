import React from "react";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  category?: { name: string };
  user?: { username: string };
  createdAt?: string;
  updatedAt?: string;
}

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  // Fungsi untuk memformat tanggal
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Fungsi untuk mengekstrak teks dari HTML untuk excerpt
  const getExcerpt = (html: string) => {
    const text = html.replace(/<[^>]+>/g, "").trim();
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
  };

  // Fungsi untuk mendapatkan warna kategori
  const getCategoryColor = (categoryName?: string) => {
    const colors = {
      Technology: "bg-blue-100 text-blue-800",
      Design: "bg-purple-100 text-purple-800",
      Development: "bg-green-100 text-green-800",
      "UI/UX": "bg-pink-100 text-pink-800",
      Web: "bg-indigo-100 text-indigo-800",
      Mobile: "bg-orange-100 text-orange-800",
      default: "bg-gray-100 text-gray-800",
    };
    return categoryName
      ? colors[categoryName as keyof typeof colors] || colors.default
      : colors.default;
  };

  // Fungsi untuk mendapatkan URL gambar dengan fallback
  const getImageUrl = (imageUrl?: string) => {
    return imageUrl && imageUrl.trim() !== ""
      ? imageUrl
      : "https://picsum.photos/200";
  };

  return (
    <Link href={`/articles/${article.id}`} className="block group">
      <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-gray-200">
        {/* Article Image */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          <img
            src={getImageUrl(article.imageUrl)}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              // Fallback jika gambar gagal dimuat
              e.currentTarget.src = "https://picsum.photos/200";
            }}
          />

          {/* Date Badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-block bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
              {formatDate(article.createdAt)}
            </span>
          </div>
        </div>

        {/* Article Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {getExcerpt(article.content)}
          </p>

          {/* Category */}
          {article.category?.name && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(
                  article.category.name
                )}`}
              >
                {article.category.name}
              </span>
            </div>
          )}

          {/* Author */}
          {article.user?.username && (
            <div className="text-gray-500 text-xs">
              <span>By {article.user.username}</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};

export default ArticleCard;
