"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Bot,
  Minus,
  Plus,
  Share,
  Flag,
  X,
  User,
  Eye,
  Clock,
  Siren,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { TextWithTooltips } from "@/components/tooltip";
import { newsArticles } from "@/lib/news-data";

// API 호출 함수
const fetchNewsDetail = async (newsId) => {
  try {
    // news-service API 직접 호출 (포트 8083)
    console.log("news-service API 호출 시도...");
    const backendResponse = await fetch(
      `http://localhost:8083/news-service/api/news/${newsId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (backendResponse.ok) {
      const data = await backendResponse.json();
      console.log("백엔드에서 받은 데이터:", data);
      return data;
    }

    throw new Error(`백엔드 API 호출 실패: ${backendResponse.status}`);
  } catch (backendError) {
    console.error("백엔드 news-service 연결 실패:", backendError.message);

    // 백엔드 연결 실패 시 로컬 데이터로 대체
    console.log("로컬 데이터로 대체합니다...");
    const localNews = newsArticles.find(
      (article) => article.id === parseInt(newsId)
    );
    if (localNews) {
      // 로컬 데이터를 백엔드 형식으로 변환
      return {
        newsId: localNews.id,
        title: localNews.title,
        content: localNews.content,
        publishedAt: localNews.publishedAt,
        createdAt: localNews.publishedAt,
        views: localNews.views,
        press: localNews.source,
        reporter: localNews.reporter || "크롤링 시스템",
        categoryName: localNews.category,
        categoryDescription: localNews.category,
        dedupState: "ORIGINAL",
        dedupStateDescription: "원본",
        updatedAt: localNews.publishedAt,
      };
    }

    throw new Error(
      "백엔드 서버에 연결할 수 없고, 로컬에서도 해당 뉴스를 찾을 수 없습니다."
    );
  }
};

// 초기 댓글 데이터
const initialComments = [
  {
    id: 1,
    author: "김민준",
    avatar: "https://placehold.co/40x40/C7D2FE/4338CA?text=김",
    text: "정책의 방향성은 좋다고 생각합니다. 다만, 실행 과정에서 중소기업들에게 실질적인 혜택이 돌아갈 수 있도록 세심한 관리가 필요해 보여요.",
    time: "2시간 전",
  },
  {
    id: 2,
    author: "이수진",
    avatar: "https://placehold.co/40x40/FBCFE8/86198F?text=이",
    text: "요약봇 기능 너무 좋네요! 긴 기사 읽기 전에 핵심을 파악할 수 있어서 편리해요.",
    time: "1시간 전",
  },
];

export default function NewsPage({ articleId }) {
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(18);
  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [readingProgress, setReadingProgress] = useState(0);

  // 백엔드에서 프론트엔드로 카테고리 변환
  const backendToFrontendCategory = {
    POLITICS: "정치",
    ECONOMY: "경제",
    SOCIETY: "사회",
    CULTURE: "생활/문화",
    INTERNATIONAL: "세계",
    IT_SCIENCE: "IT/과학",
  };

  // 프론트엔드에서 백엔드로 카테고리 변환 (역변환)
  const frontendToBackendCategory = {
    정치: "POLITICS",
    경제: "ECONOMY",
    사회: "SOCIETY",
    "생활/문화": "CULTURE",
    세계: "INTERNATIONAL",
    "IT/과학": "IT_SCIENCE",
  };
  useEffect(() => {
    const loadNewsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchNewsDetail(articleId);

        // 백엔드 데이터를 컴포넌트에서 사용하는 형식으로 변환
        const rawCategory =
          data.categoryName || data.categoryDescription || "일반";
        const convertedCategory =
          backendToFrontendCategory[rawCategory] || rawCategory;

        const transformedData = {
          category: convertedCategory,
          date: new Date(data.publishedAt || data.createdAt).toLocaleDateString(
            "ko-KR"
          ),
          title: data.title,
          reporter: {
            name: data.reporter || "크롤링 시스템",
            email: "system@newsphere.com",
            avatar: "https://placehold.co/40x40/E2E8F0/4A5568?text=기자",
          },
          content: [
            {
              type: "paragraph",
              text: data.content || "상세 내용은 원본 링크를 확인해주세요.",
            },
          ],
          url: "#", // 원본 링크는 별도 API로 처리할 수 있습니다
          views: data.views || 0,
          source: data.press || "크롤링 뉴스",
          sourceLogo: "/placeholder-logo.png",
          tags: [convertedCategory],
          newsId: data.newsId, // 백엔드 뉴스 ID 추가
          publishedAt: data.publishedAt,
          dedupState: data.dedupState,
          dedupStateDescription: data.dedupStateDescription,
        };

        setNewsData(transformedData);
      } catch (err) {
        setError(err.message);
        console.error("뉴스 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      loadNewsData();
    }

    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrollPosition = window.scrollY;
      const progress = (scrollPosition / totalHeight) * 100;
      setReadingProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [articleId]);

  const handleFontSizeChange = (amount) => {
    const newSize = fontSize + amount;
    if (newSize >= 14 && newSize <= 24) {
      setFontSize(newSize);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() === "") {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }
    const comment = {
      id: Date.now(),
      author: "나",
      avatar: "https://placehold.co/40x40/E2E8F0/4A5568?text=나",
      text: newComment,
      time: "방금 전",
    };
    setComments([comment, ...comments]);
    setNewComment("");
    toast.success("댓글이 등록되었습니다.");
  };

  const handleCommentKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleCopyUrl = () => {
    if (newsData) {
      const currentUrl = window.location.href;
      navigator.clipboard.writeText(currentUrl);
      toast.success("URL이 복사되었습니다.");
    }
  };

  const handleShareKakaoTalk = () => {
    if (newsData) {
      // 실제 카카오톡 공유는 Kakao JavaScript SDK 연동이 필요합니다.
      // 여기서는 임시로 URL 복사를 안내합니다.
      const currentUrl = window.location.href;
      navigator.clipboard.writeText(currentUrl);
      toast.info(
        "카카오톡 공유는 SDK 연동이 필요합니다. 기사 URL이 복사되었습니다."
      );
    }
  };

  const handleShareFacebook = () => {
    if (newsData) {
      const currentUrl = window.location.href;
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        currentUrl
      )}&quote=${encodeURIComponent(newsData.title)}`;
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const handleShareTwitter = () => {
    if (newsData) {
      const currentUrl = window.location.href;
      const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        currentUrl
      )}&text=${encodeURIComponent(newsData.title)}`;
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const handleShareInstagram = () => {
    if (newsData) {
      // 인스타그램은 웹에서 직접 공유하기가 어렵습니다.
      // 사용자에게 URL 복사를 안내합니다.
      const currentUrl = window.location.href;
      navigator.clipboard.writeText(currentUrl);
      toast.info(
        "인스타그램은 웹에서 직접 공유하기 어렵습니다. 기사 URL이 복사되었습니다."
      );
    }
  };

  // 데이터가 로딩 중일 때 보여줄 화면
  if (loading) {
    return <div className="container mx-auto max-w-screen-xl p-8"></div>;
  }

  if (error || !newsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
              뉴스를 찾을 수 없습니다
            </h1>
            <p className="text-center text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center">
              <Link
                href="/"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300"
              >
                메인으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const relatedNews = newsArticles
    .filter(
      (news) =>
        news.category === newsData.category && news.title !== newsData.title
    )
    .slice(0, 3);
  const headlineNews = newsArticles
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 5);
  const rankingNews = newsArticles
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return (
    <>
      <Toaster richColors position="bottom-right" />
      {/* Reading Progress Bar */}
      <div
        className="fixed top-16 left-0 h-2 z-[60] transition-all duration-100 ease-out shadow-sm"
        style={{
          width: `${readingProgress}%`,
          background:
            "linear-gradient(135deg, rgba(102, 126, 234, 1) 0%, rgba(118, 75, 162, 1) 50%, rgba(245, 87, 108, 1) 100%)",
        }}
      ></div>
      <div className="container mx-auto max-w-screen-xl p-4 lg:p-8 mt-0">
        <div className="grid grid-cols-12 gap-8">
          {/* 메인 기사 컨텐츠 */}
          <main className="col-span-12 lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <header className="border-b pb-6 mb-6">
              {/* Top row: Source, Category */}
              <div className="flex items-center space-x-2 mb-4">
                {newsData.sourceLogo && (
                  <img
                    src={newsData.sourceLogo}
                    alt={`${newsData.source} 로고`}
                    className="h-6 w-6 rounded-full"
                  />
                )}
                <span className="font-semibold text-gray-700">
                  {newsData.source}
                </span>
                <span className="text-gray-400">•</span>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {newsData.category}
                </span>
              </div>

              {/* Article Title */}
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                {newsData.title}
              </h1>

              {/* Reporter Name (left) and Date/Views (right) */}
              <div className="flex justify-between items-center text-gray-600 text-sm">
                <p className="flex items-center">
                  <User className="w-4 h-4 mr-1.5" />
                  {newsData.reporter.name} 기자
                </p>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {newsData.date}
                  </span>
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {newsData.views?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4 mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.success("기사가 스크랩되었습니다.")}
                  className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <Bookmark size={18} />
                  <span>스크랩</span>
                </button>
                <button
                  onClick={() => setSummaryModalOpen(true)}
                  className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
                >
                  <Bot size={18} />
                  <span>요약봇</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded-lg p-1">
                  <button
                    onClick={() => handleFontSizeChange(-2)}
                    className="p-1 hover:bg-gray-100 rounded-md"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-2 text-sm font-medium">가</span>
                  <button
                    onClick={() => handleFontSizeChange(2)}
                    className="p-1 hover:bg-gray-100 rounded-md"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-full hover:shadow-md"
                >
                  <Share className="w-5 h-5" />
                </button>
                <button
                  onClick={() => toast.info("기사가 신고되었습니다.")}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Siren className="w-6 h-6 text-red-500" />
                </button>
              </div>
            </div>

            <article
              className="prose prose-lg max-w-none text-lg leading-relaxed text-gray-800"
              style={{ fontSize: `${fontSize}px` }}
            >
              {newsData.content.map((item, index) => {
                if (item.type === "paragraph") {
                  return <p key={index}>{item.text}</p>;
                }
                if (item.type === "image") {
                  return (
                    <figure key={index} className="my-8">
                      <img
                        src={item.src}
                        alt={item.alt}
                        className="rounded-xl mx-auto"
                      />
                      <figcaption className="text-center text-sm text-gray-500 mt-2">
                        {item.caption}
                      </figcaption>
                    </figure>
                  );
                }
                return null;
              })}
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

            {/* 관련 뉴스, 댓글 등은 여기에 추가 */}
            <section className="mt-12 pt-8 border-t">
              <h2 className="text-2xl font-bold mb-6">함께 보면 좋은 뉴스</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedNews.map((news) => (
                  <Link
                    href={`/news/${news.id}`}
                    key={news.id}
                    className="block group"
                  >
                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <p className="text-indigo-600 font-semibold text-sm mb-1">
                        {news.category}
                      </p>
                      <h4 className="font-bold group-hover:text-indigo-700">
                        {news.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-12 pt-8 border-t">
              <h2 className="text-2xl font-bold mb-6">
                댓글 <span className="text-indigo-600">{comments.length}</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <img
                    src="https://placehold.co/40x40/E2E8F0/4A5568?text=나"
                    alt="내 프로필"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <textarea
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      rows="3"
                      placeholder="의견을 나눠보세요..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={handleCommentKeyPress}
                    />
                    <button
                      onClick={handleAddComment}
                      className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors float-right"
                    >
                      등록
                    </button>
                  </div>
                </div>
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-4">
                      <img
                        src={comment.avatar}
                        alt={`${comment.author} 프로필`}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 bg-gray-100 p-4 rounded-lg">
                        <p className="font-semibold">{comment.author}</p>
                        <p className="text-gray-700 mt-1">{comment.text}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {comment.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>

          {/* 사이드바 */}
          <aside className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold border-b pb-3 mb-4">
                헤드라인 뉴스
              </h3>
              <ul className="space-y-3">
                {headlineNews.map((news) => (
                  <li key={news.id}>
                    <Link
                      href={`/news/${news.id}`}
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {news.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold border-b pb-3 mb-4">
                랭킹 뉴스 (조회수)
              </h3>
              <ul className="space-y-3">
                {rankingNews.map((news, index) => (
                  <li key={news.id} className="flex items-center">
                    <span className="text-lg font-bold text-indigo-600 w-6">
                      {index + 1}
                    </span>
                    <Link
                      href={`/news/${news.id}`}
                      className="hover:text-indigo-600 transition-colors flex-1"
                    >
                      {news.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* 요약봇 모달 */}
      {isSummaryModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSummaryModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Bot className="text-indigo-500" /> AI 요약봇
              </h2>
              <button
                onClick={() => setSummaryModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <h3 className="font-semibold text-lg mb-3">핵심 요약</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  정부가 중소기업 지원, 기술 혁신, 내수 활성화를 골자로 하는
                  새로운 경제 정책을 발표했습니다.
                </li>
                <li>
                  기술 혁신 분야(AI, 바이오, 친환경 에너지)에 대한 집중 투자는
                  미래 성장 동력 확보를 목표로 합니다.
                </li>
                <li>
                  내수 활성화를 위해 지역 화폐 확대 및 소상공인 지원책을
                  포함했으나, 재정 건전성 우려도 존재합니다.
                </li>
                <li>
                  전문가들은 정책의 장기적 성공이 구체적인 실행 방안과 글로벌
                  경제 상황에 달려있다고 분석합니다.
                </li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-b-2xl text-center text-sm text-gray-500">
              <p>
                이 요약은 AI가 생성한 내용으로, 일부 부정확한 정보가 포함될 수
                있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 공유하기 모달 */}
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
              <h2 className="text-xl font-bold">기사 공유하기</h2>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                아래 링크를 복사하거나 SNS로 공유할 수 있습니다.
              </p>
              <div className="flex items-center border rounded-lg p-2 bg-gray-50 mb-4">
                <input
                  type="text"
                  value={
                    typeof window !== "undefined" ? window.location.href : "#"
                  }
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                  readOnly
                />
                <button
                  onClick={handleCopyUrl}
                  className="bg-indigo-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-indigo-600 transition-colors"
                >
                  복사
                </button>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleShareKakaoTalk}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FEE500] hover:opacity-80 transition-opacity"
                >
                  <img
                    src="/images/Kakaotalk.png"
                    alt="카카오톡"
                    className="w-8 h-8"
                  />
                </button>
                <button
                  onClick={handleShareFacebook}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-[#1877F2] hover:opacity-80 transition-opacity"
                >
                  <img
                    src="/images/Facebook.png"
                    alt="페이스북"
                    className="w-8 h-8"
                  />
                </button>
                <button
                  onClick={handleShareTwitter}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200 hover:opacity-80 transition-opacity"
                >
                  <img
                    src="/images/Twitter.png"
                    alt="트위터"
                    className="w-8 h-8"
                  />
                </button>
                <button
                  onClick={handleShareInstagram}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-[#E4405F] hover:opacity-80 transition-opacity"
                >
                  <img
                    src="/images/Instagram.png"
                    alt="인스타그램"
                    className="w-8 h-8"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
