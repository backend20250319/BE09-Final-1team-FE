"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated, authenticatedFetch } from "@/lib/auth";
import { newsService } from "@/lib/newsService";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const backendToFrontendCategory = {
  POLITICS: "정치",
  ECONOMY: "경제",
  SOCIETY: "사회",
  LIFE: "생활",
  INTERNATIONAL: "세계",
  IT_SCIENCE: "IT/과학",
  VEHICLE: "자동차/교통",
  TRAVEL_FOOD: "여행/음식",
  ART: "예술",
};

export default function RecentNews() {
  const [recentNews, setRecentNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    const fetchRecentNews = async () => {
      try {
        setIsLoading(true);
        // 1. 읽기 기록 ID 목록을 불러옵니다.
        const historyUrl = `/api/users/mypage/history/index?page=0&size=8&sort=updatedAt,DESC`;
        console.log("📖 RecentNews - 읽기 기록 요청:", historyUrl);

        const historyResponse = await authenticatedFetch(historyUrl);
        if (!historyResponse.ok) {
          console.error(
            "📖 RecentNews - 읽기 기록 조회 실패:",
            historyResponse.status
          );
          throw new Error("최근 본 뉴스를 불러오는데 실패했습니다.");
        }
        const historyData = await historyResponse.json();
        console.log("📖 RecentNews - 읽기 기록 응답:", historyData);

        if (historyData.success && historyData.data.content.length > 0) {
          const newsHistory = historyData.data.content;
          console.log("📖 RecentNews - 뉴스 기록 목록:", newsHistory);

          // 2. newsService를 사용해 각 기사의 상세 정보를 안정적으로 불러옵니다.
          const newsDetailsPromises = newsHistory.map((newsItem) =>
            newsService.getNewsById(newsItem.newsId)
          );

          const newsDetailsResults = await Promise.all(newsDetailsPromises);

          const enrichedNews = newsHistory
            .map((newsItem, index) => {
              const newsDetails = newsDetailsResults[index];
              // newsService.getNewsById()가 이제 직접 뉴스 객체를 반환하므로 .data 제거
              if (newsDetails) {
                return {
                  newsId: newsItem.newsId,
                  title: newsItem.newsTitle,
                  imageUrl:
                    newsDetails.imageUrl ||
                    newsDetails.image ||
                    "/placeholder.svg",
                  press: newsDetails.press || newsDetails.source || "출처 없음",
                  categoryName: newsItem.categoryName,
                };
              }
              return null;
            })
            .filter((item) => item !== null);

          console.log("🔄 RecentNews - 처리된 최근 본 뉴스:", enrichedNews);
          setRecentNews(enrichedNews);
        } else {
          console.log("📖 RecentNews - 읽기 기록이 없거나 빈 목록");
          setRecentNews([]);
        }
      } catch (error) {
        console.error("❌ RecentNews - 최근 본 뉴스 조회 실패:", error);
        setRecentNews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentNews();
  }, []);

  if (isLoading) {
    return (
      <section className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">최근 본 뉴스</h2>
        <div className="grid grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 animate-pulse bg-gray-100 rounded-lg"
            >
              <div className="w-36 h-20 bg-gray-200 rounded-md flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (recentNews.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-6">최근 본 뉴스</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {recentNews.map((news) => (
          <Link
            key={news.newsId}
            href={`/news/${news.newsId}`}
            className="block"
          >
            <div className="flex items-start gap-4 p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors h-full">
              <div className="relative w-36 h-20 flex-shrink-0 rounded-md overflow-hidden">
                <Image
                  src={news.imageUrl}
                  alt={news.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base line-clamp-2">
                  {news.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-gray-600">{news.press}</p>
                  <Badge variant="secondary" className="text-xs">
                    {backendToFrontendCategory[news.categoryName] ||
                      news.categoryName}
                  </Badge>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
