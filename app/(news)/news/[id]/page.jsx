"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AiSummaryModal from "@/components/aisummarybot/AiSummaryModal";

// UI & 아이콘 라이브러리
import { Toaster, toast } from "sonner";
import {
  User,
  Clock,
  Bookmark,
  Bot,
  Share,
  Siren,
  X,
  LogIn,
  ShieldAlert,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { newsService } from "@/lib/newsService";
import { useScrap } from "@/contexts/ScrapContext";
import useSummary from "../../../../hooks/useSummary";
import RelatedNewsCard from "./_components/RelatedNewsCard";
import RecentNews from "./_components/RecentNews";

const NewsHeader = ({ newsData }) => {
  return (
      <header className="pb-6">
        <div className="flex items-center space-x-2 mb-4">
        <span className="text-lg font-bold text-gray-700">
          {newsData.source}
        </span>
          <span className="text-gray-400">•</span>
          <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-2 py-0.5 rounded-full">
          {newsData.category}
        </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 line-clamp-2">
          {newsData.title}
        </h1>
        <div className="flex justify-between items-center text-gray-600 text-sm">
          <p className="flex items-center">
            <User className="w-4 h-4 mr-1.5" />
            {newsData.reporter.name} 기자
          </p>
          <div className="flex items-center space-x-4">
          <span className="flex items-center text-sm mr-2 text-black">
            <Clock className="h-4 w-4 mr-1" />
            {newsData.date}
          </span>
          </div>
        </div>
      </header>
  );
};

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

const reportReasons = [
  { id: "FAKE_NEWS", label: "허위 정보 / 가짜뉴스" },
  { id: "SPAM", label: "광고 / 스팸" },
  { id: "HATE_SPEECH", label: "욕설 / 혐오 발언" },
  { id: "COPYRIGHT", label: "저작권 침해" },
  { id: "OTHER", label: "기타" },
];

const ReportModal = ({ isOpen, onClose, newsId }) => {
  const [reason, setReason] = useState(reportReasons[0].id);
  const [details, setDetails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleReportClick = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);

    try {
      const authToken = localStorage.getItem("accessToken");
      const response = await fetch(`/api/news/${newsId}/report`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason, details }),
      });

      if (response.ok) {
        toast.success("기사가 정상적으로 신고되었습니다.");
        onClose();
      } else {
        const errorData = await response
        .json()
        .catch(() => ({ message: "서버 응답을 파싱할 수 없습니다." }));
        toast.error(errorData.message || "신고 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error during report:", error);
      toast.error("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>기사 신고하기</DialogTitle>
              <DialogDescription>
                신고하려는 이유를 선택해주세요. 허위 신고 시 서비스 이용에 제한을
                받을 수 있습니다.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <RadioGroup
                  defaultValue={reason}
                  onValueChange={setReason}
                  className="space-y-2"
              >
                {reportReasons.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={item.id} id={`reason-${item.id}`} />
                      <Label htmlFor={`reason-${item.id}`}>{item.label}</Label>
                    </div>
                ))}
              </RadioGroup>
              {reason === "OTHER" && (
                  <Textarea
                      placeholder="상세한 신고 내용을 입력해주세요."
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                  />
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  취소
                </Button>
              </DialogClose>
              <Button
                  type="button"
                  variant="destructive"
                  onClick={handleReportClick}
                  disabled={isLoading}
              >
                {"신고하기"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>신고 확인</DialogTitle>
              <DialogDescription>정말 신고하시겠습니까?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                  variant="secondary"
                  onClick={() => setIsConfirmModalOpen(false)}
              >
                아니오
              </Button>
              <Button
                  variant="destructive"
                  onClick={handleConfirmSubmit}
                  disabled={isLoading}
              >
                예
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
  );
};

const FontSizeButton = ({ onClick }) => {
  return (
      <button
          onClick={onClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
          aria-label="글자 크기 변경하기"
      >
        <div className="flex items-baseline">
          <span className="ml-0.5 text-xs font-semibold text-gray-600">가</span>
          <span className="text-lg font-semibold text-gray-800">가</span>
        </div>
      </button>
  );
};

const fontSizes = [
  { id: "sm", label: "아주 작게", value: 14 },
  { id: "base", label: "작게", value: 16 },
  { id: "lg", label: "보통", value: 18 },
  { id: "xl", label: "크게", value: 20 },
  { id: "2xl", label: "아주 크게", value: 22 },
];

const FontSizeSelector = ({ currentValue, onSelect, onClose }) => {
  const selectorRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectorRef, onClose]);

  return (
      <div
          ref={selectorRef}
          className="absolute bottom-full left-1/2 z-20 mb-2 w-80 -translate-x-1/2 transform"
      >
        <div className="relative rounded-xl bg-white p-6 shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-white"></div>
          <div className="relative flex flex-col items-center">
            <div className="relative flex w-full items-center justify-between">
              <div className="absolute left-0 top-1/2 w-full -translate-y-1/2">
                <div className="mx-auto h-0.5 w-[calc(100%-2rem)] bg-gray-200"></div>
              </div>
              {fontSizes.map((sizeOption) => {
                const isSelected = currentValue === sizeOption.value;
                return (
                    <button
                        key={sizeOption.id}
                        onClick={() => {
                          onSelect(sizeOption.value);
                          onClose();
                        }}
                        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                            isSelected
                                ? "border-indigo-500 bg-indigo-500 text-white"
                                : "border-gray-300 bg-white text-gray-700 hover:border-indigo-400"
                        }`}
                    >
                      가
                    </button>
                );
              })}
            </div>
            <div className="mt-3 flex w-full justify-between px-1">
              {fontSizes.map((sizeOption) => (
                  <div
                      key={sizeOption.id}
                      className={`w-10 text-center text-xs font-medium text-gray-500 whitespace-nowrap ${
                          currentValue === sizeOption.value &&
                          "font-bold text-indigo-500"
                      }`}
                  >
                    {sizeOption.label}
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

const NewsActions = ({
  newsData,
  onSummaryOpen,
  onShareOpen,
  isFontSizeSelectorOpen,
  onFontSizeSelectorToggle,
  fontSize,
  onFontSizeChange,
}) => {
  const { addScrap } = useScrap();
  const [isScrapLoading, setIsScrapLoading] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  // FontSizeSelector 상태를 NewsActions 내부에서 관리하도록 수정
  const [isFontSizeOpen, setFontSizeOpen] = useState(false);

  const handleScrap = async () => {
    if (!localStorage.getItem("accessToken")) {
      setIsLoginModalOpen(true);
      return;
    }
    if (isScrapLoading) return;

    setIsScrapLoading(true);
    try {
      await addScrap(newsData);
    } finally {
      setIsScrapLoading(false);
    }
  };

  const handleReportClick = () => {
    if (!localStorage.getItem("accessToken")) {
      setIsLoginModalOpen(true);
    } else {
      setIsReportModalOpen(true);
    }
  };

  // NewsPage에서 내려받는 isFontSizeSelectorOpen, onFontSizeSelectorToggle 대신 내부 상태 사용
  const handleFontSizeToggle = () => {
    setFontSizeOpen(prev => !prev);
  }

  return (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
              onClick={handleScrap}
              disabled={isScrapLoading}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            <Bookmark size={18} />
            <span>스크랩</span>
          </button>
          <button
              onClick={onSummaryOpen}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm font-semibold text-white"
              style={{
                background:
                    "linear-gradient(135deg, rgba(102, 126, 234, 1) 0%, rgba(118, 75, 162, 1) 50%, rgba(245, 87, 108, 1) 100%)",
              }}
          >
            <Bot size={18} />
            <span>요약봇</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <FontSizeButton onClick={handleFontSizeToggle} />
            {isFontSizeOpen && (
                <FontSizeSelector
                    currentValue={fontSize}
                    onSelect={onFontSizeChange}
                    onClose={() => setFontSizeOpen(false)}
                />
            )}
          </div>
          <button
              onClick={onShareOpen}
              className="p-2 hover:bg-gray-100 rounded-full hover:shadow-md transition-all duration-200"
          >
            <Share className="w-5 h-5 text-gray-600" />
          </button>
          <button
              onClick={handleReportClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <Siren className="w-6 h-6 text-red-500" />
          </button>
        </div>
        <ReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            newsId={newsData.newsId}
        />
        <LoginConfirmModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
        />
      </div>
  );
};

const NewsContent = ({ newsData, fontSize }) => {
  return (
      <>
        {newsData.imageUrl && (
            <div className="my-6">
              <img
                  src={newsData.imageUrl}
                  alt={newsData.title}
                  className="w-full max-h-[400px] object-cover rounded-xl mx-auto"
              />
            </div>
        )}
        <article
            className="prose prose-lg max-w-none text-lg leading-relaxed text-gray-800"
            style={{ fontSize: `${fontSize}px` }}
        >
          <div dangerouslySetInnerHTML={{ __html: newsData.content }} />
        </article>
        {newsData.tags && newsData.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                관련 키워드
              </h3>
              <div className="flex flex-wrap gap-2">
                {newsData.tags.map((tag, index) => (
                    <span
                        key={index}
                        className="bg-gray-100 text-gray-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full"
                    >
                #{tag}
              </span>
                ))}
              </div>
            </div>
        )}
      </>
  );
};

export default function NewsPage() {
  const params = useParams();
  const articleId = params?.id;

  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontSize, setFontSize] = useState(18);
  const [isFontSizeSelectorOpen, setFontSizeSelectorOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const [relatedNews, setRelatedNews] = useState([]);

  useEffect(() => {
    const fetchRelatedNews = async () => {
      if (!articleId || articleId === "undefined") return;
      try {
        const relatedArticles = await newsService.getRelatedArticles(
            articleId,
            "전체",
            4
        );
        setRelatedNews(relatedArticles || []);
      } catch (error) {
        console.error("관련 뉴스 조회 실패:", error);
        setRelatedNews([]);
      }
    };

    fetchRelatedNews();
  }, [articleId]);

  const {
    data: summaryData,
    loading: summaryLoading,
    error: summaryError,
    requestSummary,
    reset: resetSummary,
  } = useSummary();
  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);

  const openSummary = useCallback(async () => {
    setSummaryModalOpen(true);
    await requestSummary({ newsId: articleId });
  }, [articleId, requestSummary]);

  const regenerateSummary = useCallback(async () => {
    await requestSummary({ newsId: articleId, force: true });
  }, [articleId, requestSummary]);

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

  useEffect(() => {
    const loadNewsData = async () => {
      setLoading(true);
      setError(null);

      if (!articleId || articleId === "undefined") {
        setError({ status: 400, message: "기사 ID가 없습니다." });
        setLoading(false);
        return;
      }

      try {
        const result = await newsService.getNewsById(articleId, true);

        console.log("📄 뉴스 데이터 조회 결과:", result);

        if (!result) {
          setError({ status: 404, message: "기사를 찾을 수 없습니다." });
          setNewsData(null);
          setLoading(false);
          return;
        }

        const data = result;

        if (!data) {
          setError({ status: 404, message: "기사 데이터가 없습니다." });
          setNewsData(null);
          setLoading(false);
          return;
        }

        const rawCategory = data.category || data.categoryName || "일반";
        const convertedCategory =
            backendToFrontendCategory[rawCategory] || rawCategory;

        const publicationTime = data.publishedAt || data.published_at;

        const transformedData = {
          category: convertedCategory,
          date: publicationTime
              ? new Date(publicationTime).toLocaleString("ko-KR")
              : "-",
          title: data.title || "제목 없음",
          reporter: { name: data.author || data.reporterName || "박창준" },
          content: data.content || "상세 내용은 원본 링크를 확인해주세요.",
          source: data.source || data.press || "크롤링 뉴스",
          tags: data.tags || [convertedCategory],
          newsId: data.id || data.newsId,
          imageUrl: data.image || data.imageUrl,
        };

        console.log("🔄 변환된 뉴스 데이터:", transformedData);
        setNewsData(transformedData);
      } catch (error) {
        console.error("❌ 뉴스 데이터 로딩 실패:", error);
        setError({
          status: 500,
          message: error.message || "뉴스를 불러오는 중 오류가 발생했습니다.",
        });
        setNewsData(null);
      }

      setLoading(false);
    };

    if (articleId && articleId !== "undefined") {
      loadNewsData();
    }

    const handleScroll = () => {
      const totalHeight =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [articleId]);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <p></p>
        </div>
    );
  }

  if (error?.status === 403) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center bg-red-100 rounded-full">
              <ShieldAlert className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-3">
              접근이 제한된 기사입니다
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              누적된 신고 또는 기타 사유로 인해 비공개 처리되었습니다.
            </p>
            <Link
                href="/"
                className="inline-block px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-900"
            >
              메인 페이지로 돌아가기
            </Link>
          </div>
        </div>
    );
  }

  if (error || !newsData) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">뉴스를 찾을 수 없습니다</h1>
            <p className="text-gray-600 mb-6">{error?.message}</p>
            <Link
                href="/"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700"
            >
              메인으로 돌아가기
            </Link>
          </div>
        </div>
    );
  }

  return (
      <>
        <Toaster richColors position="bottom-right" />

        <div
            className="fixed top-16 left-0 h-2 z-[60]"
            style={{
              width: `${readingProgress}%`,
              background:
                  "linear-gradient(135deg, rgba(102, 126, 234, 1) 0%, rgba(118, 75, 162, 1) 50%, rgba(245, 87, 108, 1) 100%)",
            }}
        />

        <div className="container mx-auto max-w-screen-2xl p-4 lg:p-8 mt-0">
          <div className="flex justify-center">
            <main className="w-full lg:w-3/4 bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
              <NewsHeader newsData={newsData} />
              <NewsActions
                  newsData={newsData}
                  onSummaryOpen={openSummary}
                  onShareOpen={() => setShareModalOpen(true)}
                  isFontSizeSelectorOpen={isFontSizeSelectorOpen}
                  onFontSizeSelectorToggle={() =>
                      setFontSizeSelectorOpen((prev) => !prev)
                  }
                  fontSize={fontSize}
                  onFontSizeChange={setFontSize}
              />
              <NewsContent newsData={newsData} fontSize={fontSize} />

              {relatedNews.length > 0 && (
                  <section className="mt-12 pt-8 border-t">
                    <h2 className="text-2xl font-bold mb-6">함께 보면 좋은 뉴스</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                      {relatedNews.map((news) => (
                          <RelatedNewsCard key={news.newsId} news={news} />
                      ))}
                    </div>
                  </section>
              )}

              <RecentNews />

              {/* <CommentSection newsId={articleId} /> 이 부분이 삭제되었습니다. */}
            </main>
          </div>
        </div>

        <AiSummaryModal
            isOpen={isSummaryModalOpen}
            onClose={() => {
              setSummaryModalOpen(false);
              resetSummary();
            }}
            data={summaryData}
            loading={summaryLoading}
            error={summaryError}
            onRegenerate={regenerateSummary}
        />

        {isShareModalOpen && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                onClick={() => setShareModalOpen(false)}
            >
              <div
                  className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all"
                  onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold">기사 URL 복사</h2>
                  <button
                      onClick={() => setShareModalOpen(false)}
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
                        value={
                          typeof window !== "undefined" ? window.location.href : "#"
                        }
                        className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                        readOnly
                    />
                    <button
                        onClick={() => {
                          const currentUrl = window.location.href;
                          navigator.clipboard.writeText(currentUrl)
                            .then(() => {
                              toast.success("URL이 복사되었습니다.");
                              setShareModalOpen(false);
                            })
                            .catch(() => {
                                // Fallback for older browsers
                                const textarea = document.createElement("textarea");
                                textarea.value = currentUrl;
                                document.body.appendChild(textarea);
                                textarea.select();
                                try {
                                    document.execCommand("copy");
                                    toast.success("URL이 복사되었습니다.");
                                    setShareModalOpen(false);
                                } catch (err) {
                                    toast.error("URL 복사에 실패했습니다.");
                                } finally {
                                    document.body.removeChild(textarea);
                                }
                            });
                        }}
                        className="bg-indigo-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-indigo-600 transition-colors"
                    >
                      복사
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </>
  );
}
