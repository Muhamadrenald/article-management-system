"use client";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { use } from "react";
import {
  ArrowLeft,
  Calendar,
  Tag,
  Clock,
  User,
  Eye,
  Heart,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface ArticleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const resolvedParams = use(params);
  const [article, setArticle] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/articles/${resolvedParams.id}`);
        setArticle(res.data);
        setError(null);
      } catch (err: any) {
        setError(
          err.response?.status === 404
            ? "Article not found."
            : "Failed to fetch article. Please try again later."
        );
        console.error("Error fetching article:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Back button skeleton */}
            <Skeleton className="h-10 w-24" />

            {/* Card skeleton */}
            <Card className="overflow-hidden">
              {/* Hero skeleton */}
              <Skeleton className="h-72 w-full" />

              {/* Content skeleton */}
              <CardContent className="p-8 space-y-6">
                <div className="flex space-x-6">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <Separator />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-8 text-center">
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => router.push("/articles")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  // Format date if available
  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Back
          </Button>

          {/* Article Card */}
          <Card className="overflow-hidden">
            {/* Hero Section with Image */}
            <div className="relative h-80 overflow-hidden">
              {article.imageUrl && !imageError ? (
                <div className="relative h-full">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                  {/* Dark overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                </div>
              ) : (
                /* Fallback gradient background */
                <div className="relative h-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
              )}

              <div className="absolute bottom-8 left-8 right-8">
                {/* Category Badge */}
                <Badge
                  variant="secondary"
                  className="mb-4 bg-white/20 backdrop-blur-sm text-white border-white/20 hover:bg-white/30"
                >
                  <Tag className="w-3.5 h-3.5 mr-1.5" />
                  {article.category?.name || article.category || "Article"}
                </Badge>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-lg">
                  {article.title}
                </h1>
              </div>
            </div>

            {/* Article Content */}
            <CardContent className="p-8">
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 mb-10 pb-8">
                {(article.createdAt ||
                  article.created_at ||
                  article.publishedAt) && (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      {formatDate(
                        article.createdAt ||
                          article.created_at ||
                          article.publishedAt
                      )}
                    </span>
                  </div>
                )}

                {(article.readTime || article.read_time) && (
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      {article.readTime || article.read_time} min read
                    </span>
                  </div>
                )}

                {(article.author ||
                  article.user?.name ||
                  article.user?.username) && (
                  <div className="flex items-center text-muted-foreground">
                    <Avatar className="w-7 h-7 mr-2.5">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs font-semibold">
                        {(
                          article.author ||
                          article.user?.name ||
                          article.user?.username
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {article.author ||
                        article.user?.name ||
                        article.user?.username}
                    </span>
                  </div>
                )}

                {article.views && (
                  <div className="flex items-center text-muted-foreground">
                    <Eye className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      {article.views.toLocaleString()} views
                    </span>
                  </div>
                )}

                {article.likes && (
                  <div className="flex items-center text-muted-foreground">
                    <Heart className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      {article.likes} likes
                    </span>
                  </div>
                )}
              </div>

              <Separator className="mb-8" />

              {/* Article Description/Summary */}
              {(article.description || article.summary || article.excerpt) && (
                <Card className="mb-8 bg-muted/50">
                  <CardContent className="p-6">
                    <p className="text-foreground text-lg leading-relaxed font-medium italic">
                      {article.description ||
                        article.summary ||
                        article.excerpt}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Article Content */}
              <div
                className="prose prose-lg prose-neutral dark:prose-invert max-w-none
                  prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight prose-headings:mt-10 prose-headings:mb-6
                  prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg
                  prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base
                  prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-all
                  prose-strong:text-foreground prose-strong:font-bold
                  prose-em:text-muted-foreground prose-em:font-medium
                  prose-ul:text-foreground prose-ol:text-foreground prose-li:mb-2 prose-li:leading-relaxed
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted prose-blockquote:p-6 prose-blockquote:rounded-r-xl prose-blockquote:my-8 prose-blockquote:text-foreground prose-blockquote:font-medium prose-blockquote:italic
                  prose-code:bg-muted prose-code:text-foreground prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-mono
                  prose-pre:bg-muted prose-pre:text-foreground prose-pre:p-6 prose-pre:rounded-xl prose-pre:overflow-x-auto prose-pre:shadow-lg
                  prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-border
                  prose-hr:border-border prose-hr:my-10
                  prose-table:text-foreground prose-thead:text-foreground prose-th:font-bold prose-th:text-left prose-th:pb-3 prose-td:py-2
                  first-letter:text-7xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-2"
                dangerouslySetInnerHTML={{
                  __html:
                    article.content || article.body || "Content not available",
                }}
              />

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag: any, index: number) => (
                      <Badge key={index} variant="secondary">
                        <Tag className="w-3 h-3 mr-1" />
                        {typeof tag === "string" ? tag : tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer CTA */}
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              onClick={() => router.push("/articles")}
              className="group"
            >
              Browse More Articles
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
