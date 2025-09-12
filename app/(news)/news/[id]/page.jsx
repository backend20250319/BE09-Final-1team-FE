'use client';

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AiSummaryModal from "@/components/aisummarybot/AiSummaryModal";
import { Toaster } from "sonner";
import { ShieldAlert } from "lucide-react";
import { newsService } from "@/lib/api/newsService";
import useSummary from "@/lib/hooks/useSummary";

import NewsHeader from "./_components/NewsHeader";
import NewsActions from "./_components/NewsActions";
import NewsContent from "./_components/NewsContent";
import ShareModal from "./_components/ShareModal";
import RelatedNewsCard from "./_components/RelatedNewsCard";
import RecentNewsCard from "./_components/RecentNewsCard";

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

export default function NewsPage() {
  const params = useParams();
  const articleId = params?.id;

  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(18);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [relatedNews, setRelatedNews] = useState([]);

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

        if (!result) {
          setError({ status: 404, message: "기사를 찾을 수 없습니다." });
          setNewsData(null);
        } else {
          const rawCategory = result.category || result.categoryName || "일반";
          const publicationTime = result.publishedAt || result.published_at;

          const transformedData = {
            category: backendToFrontendCategory[rawCategory] || rawCategory,
            date: publicationTime ? new Date(publicationTime).toLocaleString("ko-KR") : "-",
            title: result.title || "제목 없음",
            reporter: { name: result.author || result.reporterName || "취재기자" },
            content: result.content || "상세 내용은 원본 링크를 확인해주세요.",
            source: result.source || result.press || "뉴스",
            tags: result.tags || [rawCategory],
            newsId: result.id || result.newsId,
            imageUrl: result.image || result.imageUrl,
          };
          setNewsData(transformedData);
        }
      } catch (error) {
        const status = error?.status || (error?.response && error.response.status) || 500;
        const message = error?.message || "뉴스를 불러오는 중 오류가 발생했습니다.";
        if (status !== 403) {
          console.error("❌ 뉴스 데이터 로딩 실패:", error);
        } else {
          console.info("접근 제한된 기사(403):", message);
        }
        setError({ status, message });
        setNewsData(null);
      } finally {
        setLoading(false);
      }
    };

    if (articleId && articleId !== "undefined") {
      loadNewsData();
    }
  }, [articleId]);

  useEffect(() => {
    const fetchRelatedNews = async () => {
      if (!articleId || articleId === "undefined") return;
      try {
        const relatedArticles = await newsService.getRelatedArticles(articleId, "전체", 4);
        setRelatedNews(relatedArticles || []);
      } catch (error) {
        console.error("관련 뉴스 조회 실패:", error);
        setRelatedNews([]);
      }
    };

    fetchRelatedNews();
  }, [articleId]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"></div>;
  }

  if (error?.status === 403) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center bg-red-100 rounded-full">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-3">접근이 제한된 기사입니다</h1>
          <p className="text-gray-600 text-lg mb-8">누적된 신고 또는 기타 사유로 인해 비공개 처리되었습니다.</p>
          <Link href="/" className="inline-block px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-900">
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
          <p className="text-gray-600 mb-6">{error?.message || "기사를 불러오는 데 실패했습니다."}</p>
          <Link href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700">
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
          background: "linear-gradient(135deg, rgba(102, 126, 234, 1) 0%, rgba(118, 75, 162, 1) 50%, rgba(245, 87, 108, 1) 100%)",
        }}
      />
      <div className="container mx-auto max-w-screen-2xl p-4 lg:p-8 mt-0">
        <div className="flex justify-center">
          <main className="w-full lg:w-3/4 bg-white p-6 sm:p-8 rounded-2xl shadow-lg mb-14">
            <NewsHeader newsData={newsData} />
            <NewsActions
              newsData={newsData}
              onSummaryOpen={openSummary}
              onShareOpen={() => setShareModalOpen(true)}
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
            <RecentNewsCard />
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
      <ShareModal isOpen={isShareModalOpen} onClose={() => setShareModalOpen(false)} newsData={newsData} />
    </>
  );
}
