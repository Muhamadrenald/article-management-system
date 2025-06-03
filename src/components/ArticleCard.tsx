import type React from "react";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  category?: { id: string; name: string };
  user?: { username: string };
  createdAt?: string;
  updatedAt?: string;
}

interface ArticleCardProps {
  article: Article;
  getCategoryColor?: (categoryName: string) => {
    bg: string;
    text: string;
    border: string;
  };
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  getCategoryColor,
}) => {
  // Fungsi default untuk warna kategori jika tidak disediakan
  const defaultGetCategoryColor = (categoryName: string) => {
    const colors = [
      { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
      {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
      },
      {
        bg: "bg-purple-100",
        text: "text-purple-800",
        border: "border-purple-200",
      },
      {
        bg: "bg-orange-100",
        text: "text-orange-800",
        border: "border-orange-200",
      },
      { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },
      {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        border: "border-indigo-200",
      },
      { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
      {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
      },
      { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-200" },
      { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-200" },
      {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        border: "border-emerald-200",
      },
      {
        bg: "bg-violet-100",
        text: "text-violet-800",
        border: "border-violet-200",
      },
    ];

    // Menggunakan hash sederhana dari nama kategori untuk konsistensi
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      const char = categoryName.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

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

  // Fungsi untuk mendapatkan URL gambar dengan fallback
  const getImageUrl = (imageUrl?: string) => {
    return imageUrl && imageUrl.trim() !== ""
      ? imageUrl
      : "https://picsum.photos/200";
  };

  // Mendapatkan warna kategori
  const categoryColors = article.category?.name
    ? (getCategoryColor || defaultGetCategoryColor)(article.category.name)
    : { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };

  return (
    <Link href={`/articles/${article.id}`} className="block group">
      <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-gray-200">
        {/* Article Image */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          <img
            src={getImageUrl(article.imageUrl) || "https://picsum.photos/200"}
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

          {/* Category Badge */}
          {article.category?.name && (
            <div className="absolute top-3 right-3">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${categoryColors.bg} ${categoryColors.text} ${categoryColors.border}`}
              >
                {article.category.name}
              </span>
            </div>
          )}
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

          {/* Author */}
          {article.user?.username && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>By {article.user.username}</span>
              <span className="text-gray-400">•</span>
              <span>{formatDate(article.createdAt)}</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};

export default ArticleCard;
