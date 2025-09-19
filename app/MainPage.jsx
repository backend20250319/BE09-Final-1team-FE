"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Bookmark,
  Share,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LogIn,
  X,
} from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { TextWithTooltips } from "@/components/tooltip";
import { getUserRole, isAuthenticated } from "@/lib/auth/auth"; // isAuthenticated 임포트
import dynamic from "next/dynamic";
import useSWR from "swr";
import { useScrap } from "@/contexts/ScrapContext";

const RealTimeKeywordWidget = dynamic(
  () => import("@/components/common/RealTimeKeywordWidget"),
  {
    ssr: true,
    loading: () => (
      <div className="glass-enhanced hover-lift animate-slide-in rounded-xl shadow-md px-4 py-3 shimmer-effect relative">
        <div className="glass-content">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-sm font-semibold">
              <div className="h-4 w-4 mr-2 bg-gray-300 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-300 rounded animate-pulse" />
            </div>
            <div className="h-3 w-20 bg-gray-300 rounded animate-pulse" />
          </div>
          <div className="h-9 flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 animate-pulse">
            <div className="h-4 w-16 bg-gray-300 rounded" />
            <div className="h-4 w-24 bg-gray-300 rounded" />
          </div>
        </div>
      </div>
    ),
  }
);

const LoginConfirmModal = ({ isOpen, onClose }) => {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push("/auth");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <LogIn className="mr-2 h-5 w-5" />
            로그인 필요
          </DialogTitle>
          <DialogDescription>
            이 기능을 사용하려면 로그인이 필요합니다. 로그인 페이지로
            이동하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <button
            type="button"
            onClick={handleLoginRedirect}
            className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            style={{
              background:
                "linear-gradient(135deg, rgba(102, 126, 234, 1) 0%, rgba(118, 75, 162, 1) 50%, rgba(245, 87, 108, 1) 100%)",
            }}
          >
            로그인
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ShareModal = ({ newsItem, onClose }) => {
  if (!newsItem) return null;

  const newsUrl = `${window.location.origin}/news/${newsItem.id}`;

  const copyUrl = () => {
    navigator.clipboard
      .writeText(newsUrl)
      .then(() => {
        toast.success("URL이 복사되었습니다.");
        onClose();
      })
      .catch(() => {
        const textarea = document.createElement("textarea");
        textarea.value = newsUrl;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          toast.success("URL이 복사되었습니다.");
          onClose();
        } catch (err) {
          toast.error("URL 복사에 실패했습니다.");
        } finally {
          document.body.removeChild(textarea);
        }
      });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">기사 URL 복사</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            아래 버튼을 눌러 기사 URL을 복사할 수 있습니다.
          </p>
          <div className="flex items-center border rounded-lg p-2 bg-gray-50">
            <input
              type="text"
              value={newsUrl}
              className="flex-1 bg-transparent outline-none text-sm text-gray-700"
              readOnly
            />
            <button
              onClick={copyUrl}
              className="bg-indigo-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-indigo-600 transition-colors"
            >
              복사
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MainPage({
  initialTrending,
  initialList,
  initialTotalPages,
  initialTotalElements,
}) {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [isLoaded, setIsLoaded] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages || 1);
  const [totalElements, setTotalElements] = useState(initialTotalElements || 0);
  const [newsItems, setNewsItems] = useState(initialList || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popularNews, setPopularNews] = useState(
    initialTrending || {
      id: 1,
      title: "뉴스를 불러오는 중...",
      content: "잠시만 기다려주세요.",
      source: "시스템",
      publishedAt: new Date().toISOString(),
      category: "GENERAL",
      image: "/placeholder.jpg",
      views: 0,
    }
  );
  const [popularNewsLoading, setPopularNewsLoading] = useState(false);
  const [relatedNews, setRelatedNews] = useState([]);

  const { addScrap, scraps } = useScrap();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [newsToShare, setNewsToShare] = useState(null);

  const itemsPerPage = 21;
  const fetcher = (url) => fetch(url).then((r) => r.json());

  const backendPage = currentPage - 1;
  const categoryParam =
    selectedCategory === "전체" ? "" : `&category=${selectedCategory}`;
  const listKey = `/api/news?page=${backendPage}&size=${itemsPerPage}${categoryParam}`;

  const { data: listData, isLoading: listLoading } = useSWR(listKey, fetcher, {
    fallbackData: {
      content: initialList,
      totalPages: initialTotalPages,
      totalElements: initialTotalElements,
    },
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  });

  const { data: trendingData } = useSWR(
    "/api/news/trending?hours=24&limit=1",
    fetcher,
    {
      fallbackData: initialTrending
        ? { content: [initialTrending] }
        : undefined,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
    }
  );

  const { data: relatedData } = useSWR(
    popularNews?.id ? `/api/news/related/${popularNews.id}` : null,
    fetcher,
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 15000,
    }
  );

  useEffect(() => {
    if (!listData?.content) return;

    // 깊은 비교를 위해 JSON.stringify 사용
    const newMapped = (listData.content ?? []).map((news) => ({
      id: news.newsId,
      title: news.title,
      content: news.content,
      source: news.press,
      publishedAt: news.publishedAt,
      category: news.categoryName,
      image: news.imageUrl,
      views: news.viewCount ?? 0,
      newsId: news.newsId,
      imageUrl: news.imageUrl,
      reporterName: news.reporterName,
      press: news.press,
    }));

    // 이전 데이터와 비교해서 실제로 변경된 경우에만 업데이트
    const currentDataStr = JSON.stringify(newsItems);
    const newDataStr = JSON.stringify(newMapped);

    if (currentDataStr !== newDataStr) {
      setNewsItems(newMapped);
      setTotalPages(listData.totalPages ?? 1);
      setTotalElements(listData.totalElements ?? newMapped.length);
      setLoading(false);
    }
  }, [listData?.content, listData?.totalPages, listData?.totalElements]);

  useEffect(() => {
    const src = trendingData?.content?.[0];
    if (!src) return;

    const newPopularNews = {
      id: src.newsId ?? src.id,
      title: src.title,
      content: src.content ?? src.summary ?? "",
      source: src.press ?? src.source ?? "알 수 없음",
      publishedAt: src.publishedAt,
      category: src.categoryName ?? src.category,
      image: src.imageUrl ?? src.image ?? "/placeholder.jpg",
      views: src.viewCount ?? src.views ?? 0,
      newsId: src.newsId ?? src.id,
      imageUrl: src.imageUrl ?? src.image ?? "/placeholder.jpg",
      reporterName: src.reporterName,
      press: src.press ?? src.source ?? "알 수 없음",
    };

    // 이전 데이터와 비교해서 실제로 변경된 경우에만 업데이트
    if (JSON.stringify(popularNews) !== JSON.stringify(newPopularNews)) {
      setPopularNews(newPopularNews);
    }
  }, [trendingData?.content?.[0]?.newsId, trendingData?.content?.[0]?.title]);

  useEffect(() => {
    if (!relatedData || !Array.isArray(relatedData)) {
      if (relatedNews.length > 0) {
        setRelatedNews([]);
      }
      return;
    }

    const newMapped = relatedData.slice(0, 2).map((news) => ({
      id: news.newsId,
      title: news.title,
      content: news.summary || "",
      source: news.press,
      publishedAt: news.publishedAt,
      category: news.categoryName,
      image: news.imageUrl || "/placeholder.jpg",
      views: 0,
      newsId: news.newsId,
      imageUrl: news.imageUrl || "/placeholder.jpg",
      reporterName: news.reporterName,
      press: news.press,
    }));

    // 이전 데이터와 비교해서 실제로 변경된 경우에만 업데이트
    if (JSON.stringify(relatedNews) !== JSON.stringify(newMapped)) {
      setRelatedNews(newMapped);
    }
  }, [relatedData?.length, relatedData?.[0]?.newsId, relatedData?.[1]?.newsId]);

  useEffect(() => {
    if (isLoaded) {
      setCurrentPage(1);
    }
  }, [selectedCategory, isLoaded]);

  useEffect(() => {
    setUserRole(getUserRole());
  }, []);

  const handleScrapClick = async (e, newsItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated()) {
      // 수정된 부분
      setIsLoginModalOpen(true);
      return;
    }
    const scrapData = {
      newsId: newsItem.id,
      title: newsItem.title,
      imageUrl: newsItem.image,
      press: newsItem.source,
      reporterName: newsItem.reporterName || "기자 정보 없음",
      publishedAt: newsItem.publishedAt,
      categoryName: newsItem.category,
    };
    await addScrap(scrapData);
  };

  const handleShareClick = (e, newsItem) => {
    e.preventDefault();
    e.stopPropagation();
    setNewsToShare(newsItem);
  };

  const categories = [
    "전체",
    "POLITICS",
    "ECONOMY",
    "SOCIETY",
    "LIFE",
    "INTERNATIONAL",
    "IT_SCIENCE",
    "VEHICLE",
    "TRAVEL_FOOD",
    "ART",
  ];
  const categoryDisplayNames = {
    전체: "전체",
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
  const filteredNewsItems = newsItems;

  // 디버깅을 위한 로그 추가
  console.log('MainPage 렌더링 상태:', {
    isLoaded,
    newsItemsCount: newsItems.length,
    filteredNewsItemsCount: filteredNewsItems.length,
    popularNews: popularNews?.title,
    totalPages,
    currentPage,
    error,
    listData: listData?.content?.length,
    listLoading,
    initialList: initialList?.length,
    initialTrending: initialTrending?.title
  });
  
  // 뉴스 아이템 상세 정보 로그
  if (newsItems.length > 0) {
    console.log('뉴스 아이템 샘플:', newsItems.slice(0, 2));
  } else {
    console.log('뉴스 아이템이 비어있음');
  }

  if (error && !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="glass hover-lift shadow-lg border-0 px-8 py-12 text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 korean-text">
            오류가 발생했습니다
          </h3>
          <p className="text-gray-600 mb-6 korean-text">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            새로고침
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="lg:col-span-3">
          <div className="mb-6">
            <div className="flex flex-col">
              <div className="w-full overflow-x-auto flex space-x-3 pb-2">
                {categories.map((category, index) => (
                  <Button
                    key={`category-${category}-${index}`}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="default"
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap hover-lift text-base px-4 py-2 korean-text ${
                      isLoaded ? "animate-slide-in" : "opacity-0"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {categoryDisplayNames[category]}
                  </Button>
                ))}
              </div>
              <div className="w-full">
                {/* <RealTimeKeywordWidget width="100%" /> */}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Link href={`/news/${popularNews?.id}`}>
                <Card className="relative overflow-hidden glass hover-lift animate-slide-in h-[780px] rounded-xl cursor-pointer">
                  {popularNewsLoading && !initialTrending ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : popularNews ? (
                    <>
                      <img
                        src={popularNews.image}
                        alt={popularNews.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                        onError={(e) => (e.target.src = "/placeholder.jpg")}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 md:p-6 flex flex-col justify-end text-white">
                        <Badge className="bg-red-600 text-white px-4 py-1 rounded-full shadow-lg font-bold tracking-wider mb-3 w-fit">
                          트렌딩 (24시간)
                        </Badge>
                        <h2 className="text-lg lg:text-xl font-bold mb-2 line-clamp-2 korean-text">
                          {popularNews.title}
                        </h2>

                        <p className="text-sm mb-4 line-clamp-2 korean-text">
                          <TextWithTooltips
                            text={
                              popularNews.content
                                ? popularNews.content
                                    .replace(/<[^>]*>?/gm, "")
                                    .substring(0, 150) + "..."
                                : "내용을 불러올 수 없습니다."
                            }
                          />
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-300">
                          <span>
                            {popularNews.source} •{" "}
                            {new Date(
                              popularNews.publishedAt
                            ).toLocaleDateString("ko-KR", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => handleScrapClick(e, popularNews)}
                              className={`p-2 rounded-full transition-all duration-200 ${
                                isAuthenticated() 
                                  ? "hover:bg-gray-100/20" 
                                  : "hover:bg-blue-500/20"
                              }`}
                              title={!isAuthenticated() ? "로그인 후 스크랩 가능" : "스크랩"}
                            >
                              <Bookmark className={`w-4 h-4 ${
                                isAuthenticated() ? "text-white" : "text-blue-200"
                              }`} />
                            </button>
                            <button
                              onClick={(e) => handleShareClick(e, popularNews)}
                              className="p-2 hover:bg-gray-100/20 rounded-full transition-all duration-200"
                            >
                              <Share className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      인기 뉴스를 불러올 수 없습니다.
                    </div>
                  )}
                </Card>
              </Link>
            </div>

            <div
              className="lg:col-span-1 flex flex-col gap-6"
              style={{ height: "780px" }}
            >
              {(relatedNews.length > 0
                ? relatedNews
                : filteredNewsItems.slice(0, 2)
              ).map((item, index) => (
                <Link
                  key={`sidebar-news-${item.id || index}`}
                  href={`/news/${item.id}`}
                  className="block flex-1 min-h-0"
                >
                  <Card className="w-full flex flex-col glass hover-lift animate-slide-in cursor-pointer transition-all duration-300 hover:shadow-lg h-full rounded-xl">
                    <div className="h-[160px] w-full relative">
                      <img
                        src={item.image || "/placeholder.jpg"}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-t-xl"
                        loading="eager"
                        onError={(e) => {
                          e.target.src = "/placeholder.jpg";
                        }}
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-1 px-4 py-3 min-h-0">
                      <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-2">
                          <Badge className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">
                            {categoryDisplayNames[item.category] ||
                              item.category}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center flex-shrink-0 ml-2">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(item.publishedAt).toLocaleDateString(
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
                        <div className="flex-1 mt-1 pb-3 border-b border-gray-100">
                          <h3 className="text-lg font-bold hover:text-blue-600 transition-colors leading-relaxed korean-text line-clamp-3">
                            <TextWithTooltips text={item.title} />
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 mt-2">
                        <span className="text-sm text-gray-500 font-medium truncate mr-2">
                          {item.source}
                        </span>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <button
                            onClick={(e) => handleScrapClick(e, item)}
                            className={`p-2 rounded-full transition-all duration-200 ${
                              isAuthenticated() 
                                ? "hover:bg-gray-100" 
                                : "hover:bg-blue-50"
                            }`}
                            title={!isAuthenticated() ? "로그인 후 스크랩 가능" : "스크랩"}
                          >
                            <Bookmark className={`w-4 h-4 ${
                              isAuthenticated() ? "text-gray-600" : "text-blue-500"
                            }`} />
                          </button>
                          <button
                            onClick={(e) => handleShareClick(e, item)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                          >
                            <Share className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {filteredNewsItems.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📰</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 korean-text">
                  뉴스를 불러오는 중입니다...
                </h3>
                <p className="text-gray-600 korean-text">
                  잠시만 기다려주세요. 뉴스 데이터를 가져오고 있습니다.
                </p>
              </div>
            ) : (
              filteredNewsItems.map((news, index) => (
              <Link
                key={`main-news-${news.id || index}`}
                href={`/news/${news.id}`}
                prefetch={false}
                className="block h-[550px]"
              >
                <Card
                  className={`w-full flex flex-col glass hover-lift animate-slide-in cursor-pointer transition-all duration-300 hover:shadow-lg h-full rounded-xl ${
                    isLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${(index + 1) * 0.2}s` }}
                >
                  <div className="h-[250px] w-full relative">
                    <img
                      src={news.image || "/placeholder.jpg"}
                      alt={news.title}
                      className="w-full h-full object-cover rounded-t-xl"
                      loading="eager"
                      onError={(e) => {
                        e.target.src = "/placeholder.jpg";
                      }}
                    />
                  </div>
                  <div className="flex flex-col justify-between flex-1 px-4 py-3 min-h-0">
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex justify-between items-center mb-2">
                        <Badge className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">
                          {categoryDisplayNames[news.category] || news.category}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center flex-shrink-0 ml-2">
                          <Clock className="h-3 w-3 mr-1" />
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
                      <div className="flex-1 mt-1 pb-3 border-b border-gray-100">
                        <h3 className="text-xl font-bold hover:text-blue-600 transition-colors leading-relaxed korean-text line-clamp-3">
                          <TextWithTooltips text={news.title} />
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 mt-2">
                      <span className="text-sm text-gray-500 font-medium truncate mr-2">
                        {news.source}
                      </span>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          onClick={(e) => handleScrapClick(e, news)}
                          className={`p-2 rounded-full transition-all duration-200 ${
                            isAuthenticated() 
                              ? "hover:bg-gray-100" 
                              : "hover:bg-blue-50"
                          }`}
                          title={!isAuthenticated() ? "로그인 후 스크랩 가능" : "스크랩"}
                        >
                          <Bookmark className={`w-4 h-4 ${
                            isAuthenticated() ? "text-gray-600" : "text-blue-500"
                          }`} />
                        </button>
                        <button
                          onClick={(e) => handleShareClick(e, news)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                        >
                          <Share className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col items-center space-y-6 mt-16 mb-12">
              <Card className="glass hover-lift shadow-lg border-0 px-6 py-4">
                <div className="text-center">
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent korean-text">
                    {currentPage} / {totalPages} 페이지
                  </p>
                  <p className="text-base text-gray-600 mt-2 korean-text">
                    총 {totalElements?.toLocaleString() || "0"}개의 뉴스
                  </p>
                </div>
              </Card>
              <Card className="glass hover-lift shadow-lg border-0 p-4">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/20 hover-lift transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                    <span className="hidden sm:inline text-base font-medium">
                      첫 페이지
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/20 hover-lift transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline text-base font-medium">
                      이전
                    </span>
                  </Button>
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2)
                        pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      return (
                        <Button
                          key={`pagination-${pageNum}-${i}`}
                          variant={
                            currentPage === pageNum ? "default" : "ghost"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-14 h-14 px-0 rounded-lg font-bold text-lg transition-all duration-300 ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover-lift"
                              : "hover:bg-white/20 hover-lift hover:scale-105"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/20 hover-lift transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline text-base font-medium">
                      다음
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/20 hover-lift transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline text-base font-medium">
                      마지막
                    </span>
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
              <Card className="glass hover-lift shadow-lg border-0 px-6 py-4">
                <div className="flex items-center space-x-3 text-base">
                  <span className="text-gray-700 font-semibold">
                    페이지로 이동:
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        setCurrentPage(page);
                      }
                    }}
                    className="w-20 px-3 py-2 bg-white/50 border border-white/30 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200"
                    placeholder="페이지"
                  />
                  <span className="text-gray-600 font-medium">
                    / {totalPages}
                  </span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      <LoginConfirmModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      {newsToShare && (
        <ShareModal
          newsItem={newsToShare}
          onClose={() => setNewsToShare(null)}
        />
      )}
    </div>
  );
}
