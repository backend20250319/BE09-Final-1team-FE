"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Toaster } from "sonner";
import { ShieldAlert } from 'lucide-react'; // 아이콘을 위해 임포트합니다.

import Header from "@/components/header";
import { newsService } from "@/lib/newsService";

import NewsHeader from "./_components/NewsHeader";
import NewsActions from "./_components/NewsActions";
import NewsContent from "./_components/NewsContent";
import CommentSection from "./_components/CommentSection";
import SummaryModal from "./_components/SummaryModal";
import ShareModal from "./_components/ShareModal";

export default function NewsPage() {
  const params = useParams();
  const articleId = params?.id;

  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontSize, setFontSize] = useState(18);
  const [isFontSizeSelectorOpen, setFontSizeSelectorOpen] = useState(false);
  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const backendToFrontendCategory = {
    POLITICS: "정치",
    ECONOMY: "경제",
    SOCIETY: "사회",
    CULTURE: "생활/문화",
    INTERNATIONAL: "세계",
    IT_SCIENCE: "IT/과학",
  };

  useEffect(() => {
    const loadNewsData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await newsService.getNewsById(articleId);
        if (!data) throw new Error("뉴스를 찾을 수 없습니다.");

        const rawCategory = data.category || data.categoryName || data.categoryDescription || "일반";
        const convertedCategory = backendToFrontendCategory[rawCategory] || rawCategory;

        const transformedData = {
          category: convertedCategory,
          date: data.publishedAt ? new Date(data.publishedAt).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-",
          title: data.title,
          reporter: { name: data.reporter || data.author || "크롤링 시스템", email: "system@newsphere.com", avatar: "https://placehold.co/40x40/E2E8F0/4A5568?text=기자" },
          content: data.content || "상세 내용은 원본 링크를 확인해주세요.",
          url: "#",
          views: data.views || 0,
          source: data.press || data.source || "크롤링 뉴스",
          sourceLogo: "/placeholder-logo.png",
          tags: data.tags || [convertedCategory],
          newsId: data.newsId || data.id,
          publishedAt: data.publishedAt,
          dedupState: data.dedupState,
          dedupStateDescription: data.dedupStateDescription,
          imageUrl: data.image,
        };
        setNewsData(transformedData);
      } catch (err) {
        setError(err);
        setNewsData(null);
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      loadNewsData();
    }

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPosition = window.scrollY;
      const progress = (scrollPosition / totalHeight) * 100;
      setReadingProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [articleId]);

  if (loading) {
    return (
        <>
          <Header />
          <div className="container mx-auto max-w-screen-xl p-8">
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-600">뉴스 로딩 중...</p>
            </div>
          </div>
        </>
    );
  }

  if (error?.status === 403) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center transform transition-all hover:scale-[1.01] duration-300">
            <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center bg-red-100 rounded-full">
              <ShieldAlert className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              접근이 제한된 기사입니다
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              요청하신 기사는 누적된 신고 또는 기타 사유로 인해<br />
              관리자에 의해 비공개 처리되었습니다.
            </p>
            <Link 
              href="/"
              className="inline-block px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-all duration-300 transform hover:-translate-y-1"
            >
              메인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (error || !newsData) {
    return (
        <>
          <Header />
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">뉴스를 찾을 수 없습니다</h1>
                <p className="text-center text-gray-600 mb-6">{error.message}</p>
                <div className="flex justify-center">
                  <Link href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300">
                    메인으로 돌아가기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
    );
  }

  return (
      <>
        <Header />
        <Toaster richColors position="bottom-right" />

        <div
            className="fixed top-16 left-0 h-2 z-[60] transition-all duration-100 ease-out shadow-sm"
            style={{
              width: `${readingProgress}%`,
              background: "linear-gradient(135deg, rgba(102, 126, 234, 1) 0%, rgba(118, 75, 162, 1) 50%, rgba(245, 87, 108, 1) 100%)",
            }}
        ></div>

        <div className="container mx-auto max-w-screen-xl p-4 lg:p-8 mt-0">
          <div className="grid grid-cols-12 gap-8">
            <main className="col-span-12 lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
              <NewsHeader newsData={newsData} />
              <NewsActions
                  newsData={newsData}
                  onSummaryOpen={() => setSummaryModalOpen(true)}
                  onShareOpen={() => setShareModalOpen(true)}
                  isFontSizeSelectorOpen={isFontSizeSelectorOpen}
                  onFontSizeSelectorToggle={() => setFontSizeSelectorOpen(prev => !prev)}
                  fontSize={fontSize}
                  onFontSizeChange={setFontSize}
              />
              <NewsContent newsData={newsData} fontSize={fontSize} />

              <section className="mt-12 pt-8 border-t">
                <h2 className="text-2xl font-bold mb-6">함께 보면 좋은 뉴스</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                </div>
              </section>

              <CommentSection />
            </main>

            <aside className="col-span-12 lg:col-span-4 space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border">
                <h3 className="text-xl font-bold border-b pb-3 mb-4">헤드라인 뉴스</h3>
                <ul className="space-y-3"></ul>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border">
                <h3 className="text-xl font-bold border-b pb-3 mb-4">랭킹 뉴스</h3>
                <ul className="space-y-3"></ul>
              </div>
            </aside>
          </div>
        </div>

        <SummaryModal isOpen={isSummaryModalOpen} onClose={() => setSummaryModalOpen(false)} />
        <ShareModal isOpen={isShareModalOpen} onClose={() => setShareModalOpen(false)} newsData={newsData} />
      </>
  );
}
