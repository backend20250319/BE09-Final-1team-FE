"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Search,
  User,
  Menu,
  Bookmark,
  Share2,
  Clock,
  Eye,
  TrendingUp,
  Zap,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { TextWithTooltips } from "@/components/tooltip";
import WeatherWidget from "@/components/WeatherWidget";
import { newsService, CATEGORY_MAPPING } from "@/lib/newsService";
import SubscribeForm from "@/components/SubscribeForm";
import SubscriberCount from "@/components/SubscriberCount";
import { getUserRole } from "@/lib/auth";

export default function MainPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [isLoaded, setIsLoaded] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [displayCount, setDisplayCount] = useState(20); // 표시할 기사 개수
  const [allNewsItems, setAllNewsItems] = useState([]); // 전체 기사 데이터

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        let data;

        // 카테고리에 따라 다른 API 호출 - CATEGORY_MAPPING 사용
        if (selectedCategory === "전체") {
          console.log("전체 뉴스 조회");
          data = await newsService.getAllNews();
        } else {
          console.log(`카테고리 뉴스 조회: ${selectedCategory}`);
          data = await newsService.getNewsByCategory(selectedCategory);
        }

        console.log("받은 뉴스 데이터:", data);
        setAllNewsItems(data); // 전체 데이터 저장
        setDisplayCount(20); // 카테고리 변경 시 표시 개수 초기화
      } catch (error) {
        console.error("뉴스 데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
        setIsLoaded(true);
      }
    };

    fetchNews();

    // 첫 로딩 시에만 사용자 역할 확인
    if (userRole === null) {
      setUserRole(getUserRole());
    }
  }, [selectedCategory]); // selectedCategory 변경 시에도 새로 데이터 로딩

  const categories = [
    "전체",
    "정치",
    "경제",
    "사회",
    "생활/문화",
    "세계",
    "IT/과학",
  ];
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 표시할 뉴스 목록 (displayCount만큼만 표시)
  const displayedNewsItems = allNewsItems.slice(0, displayCount);

  // 더보기 버튼 표시 여부
  const hasMore = displayCount < allNewsItems.length;

  // 더보기 함수
  const loadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 20, allNewsItems.length));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Tabs */}
            <div className="mb-6">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {categories.map((category, index) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap hover-lift ${
                      isLoaded ? "animate-slide-in" : "opacity-0"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* News List */}
            <div className="space-y-6">
              {displayedNewsItems.map((news, index) => (
                <Link
                  key={news.id}
                  href={`/news/${news.id}`}
                  prefetch={false}
                  className="block"
                >
                  <Card
                    className={`glass hover-lift animate-slide-in cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      isLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ animationDelay: `${(index + 1) * 0.2}s` }}
                  >
                    <div className="md:flex">
                      <div className="md:w-1/3 relative">
                        <img
                          src={news.image || "/placeholder.svg"}
                          alt={news.title}
                          className="w-full h-48 md:h-full object-cover rounded-l-lg"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">
                            {news.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex items-center justify-between mb-2">
                          <Label
                            theme="category"
                            className="text-sm font-medium text-blue-600"
                          >
                            {news.category}
                          </Label>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(news.publishedAt).toLocaleDateString(
                              "ko-KR",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3 hover:text-blue-600 transition-colors">
                          <TextWithTooltips text={news.title} />
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          <TextWithTooltips text={news.summary} />
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {news.source} •{" "}
                            {news.author || news.reporter
                              ? `${news.author || news.reporter} 기자`
                              : ""}
                          </span>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500 flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {news.views.toLocaleString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover-glow"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover-glow"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}

              {/* 더보기 버튼 */}
              {hasMore && (
                <div className="flex justify-center pt-8">
                  <Button
                    onClick={loadMore}
                    variant="outline"
                    size="lg"
                    className="hover-lift px-8 py-3 text-lg font-medium"
                  >
                    뉴스 더보기
                  </Button>
                </div>
              )}
              
              {/* 전체 기사 개수 표시 */}
              <div className="text-center text-gray-500 mt-6">
                총 {allNewsItems.length}개의 기사 중 {displayedNewsItems.length}개 표시
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Newsletter Subscription */}
              <div
                className="animate-slide-in"
                style={{ animationDelay: "0.3s" }}
              >
                <SubscribeForm />
              </div>

              {/* Trending Topics */}
              <Card
                className="glass hover-lift animate-slide-in"
                style={{ animationDelay: "0.4s" }}
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
                    실시간 인기 키워드
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      "인공지능",
                      "경제정책",
                      "환경보호",
                      "디지털전환",
                      "스타트업",
                    ].map((keyword, index) => (
                      <div
                        key={keyword}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 transition-all duration-300 trending-keyword"
                      >
                        <span className="flex items-center">
                          <span className="text-sm font-medium text-blue-600 mr-2">
                            {index + 1}
                          </span>
                          {keyword}
                        </span>
                        <Badge className="!bg-red-500 !text-white text-xs rounded-full px-3 py-1 shadow-md">
                          HOT
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weather Widget */}
              <WeatherWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
