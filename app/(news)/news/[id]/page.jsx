"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/header";
import { useScrap } from "@/contexts/ScrapContext";
import { newsService } from "@/lib/newsService";

import Link from "next/link";
import { Bookmark, Bot, Share, X, User, Clock, Siren } from "lucide-react";
import { Toaster, toast } from "sonner";

// ✨ 1. '가가' 모양의 최신 네이버 스타일 아이콘 버튼 컴포넌트
const NaverFontButtonV2 = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white transition-all duration-200 hover:border-gray-500"
      aria-label="글자 크기 변경하기"
    >
      {/* items-baseline으로 크기가 다른 텍스트의 밑단을 맞춰줍니다. */}
      <div className="flex items-baseline">
        <span className="text-sm font-bold text-gray-800">가</span>
        <span className="ml-0.5 text-xs font-bold text-gray-600">가</span>
      </div>
    </button>
  );
};

const fontSizes = [
  { id: "sm", label: "작게", value: 14 },
  { id: "base", label: "보통", value: 16 },
  { id: "lg", label: "크게", value: 18 },
  { id: "xl", label: "아주크게", value: 20 },
  { id: "2xl", label: "최대크게", value: 22 },
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
            {fontSizes.map((sizeOption) => {
              const isSelected = currentValue === sizeOption.value;
              return (
                <div
                  key={sizeOption.id}
                  className={`w-10 text-center text-xs font-medium text-gray-500 whitespace-nowrap ${
                    isSelected && "font-bold text-indigo-500"
                  }`}
                >
                  {sizeOption.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function NewsPage() {
  const params = useParams();
  const articleId = params?.id;

  console.log("🔍 뉴스 상세 페이지 파라미터:", { params, articleId });

  const { addScrap } = useScrap();
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontSize, setFontSize] = useState(18);
  const [isFontSizeSelectorOpen, setFontSizeSelectorOpen] = useState(false);

  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [comments, setComments] = useState([
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
  ]);
  const [newComment, setNewComment] = useState("");
  const [readingProgress, setReadingProgress] = useState(0);

  // 관련 뉴스 데이터 (실제 API에서 가져올 예정)
  const [relatedNews, setRelatedNews] = useState([]);
  const [headlineNews, setHeadlineNews] = useState([]);
  const [rankingNews, setRankingNews] = useState([]);

  const backendToFrontendCategory = {
    POLITICS: "정치",
    ECONOMY: "경제",
    SOCIETY: "사회",
    CULTURE: "생활/문화",
    LIFE: "생활",
    INTERNATIONAL: "세계",
    IT_SCIENCE: "IT/과학",
  };

  useEffect(() => {
    const loadNewsData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔄 뉴스 데이터 로딩 시작:", articleId);

        // 새로운 API 호출 (기존 API에 503 오류가 있어서 임시로 변경)
        const response = await fetch(`/api/news-detail?id=${articleId}`);
        console.log("📡 API 응답 상태:", response.status, response.statusText);

        if (!response.ok) {
          console.error(
            "❌ API 응답 오류:",
            response.status,
            response.statusText
          );
          throw new Error(`뉴스를 불러올 수 없습니다. (${response.status})`);
        }

        const data = await response.json();
        console.log("✅ 받은 뉴스 데이터:", data);

        if (!data || !data.title) {
          throw new Error("뉴스 데이터가 올바르지 않습니다.");
        }

        // 백엔드 응답을 프론트엔드 형식으로 변환
        const rawCategory = data.category || "일반";
        const convertedCategory =
          backendToFrontendCategory[rawCategory] || rawCategory;

        const transformedData = {
          ...data,
          category: convertedCategory,
          reporterName: data.reporterName || data.reporter || "알 수 없음",
          source: data.source || data.press || "알 수 없음",
          image: data.image || data.imageUrl || "/placeholder.jpg",
          views: data.views || data.viewCount || 0,
          publishedAt: data.publishedAt,
          content: data.content || "내용이 없습니다.",
          tags: data.tags || [convertedCategory],
        };

        setNewsData(transformedData);
        setError(null);

        // 실제 데이터 로드 완료 알림
        console.log("✅ 뉴스 데이터 로드 완료");

        // 사용자가 뉴스를 조회했으므로, 조회 기록을 서버에 저장합니다.
        try {
          await newsService.recordNewsView(articleId);
          console.log("📝 뉴스 조회 기록이 저장되었습니다.");
        } catch (viewError) {
          console.error("❌ 뉴스 조회 기록 저장 실패:", viewError);
          // 조회 기록 저장 실패는 전체 페이지 로딩에 영향을 주지 않도록 합니다.
        }
      } catch (err) {
        console.error("❌ 뉴스 상세 데이터 로딩 실패:", err);
        setError(err.message || "뉴스를 불러올 수 없습니다.");
        setNewsData(null);
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

  if (error || !newsData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    뉴스를 불러올 수 없습니다
                  </h1>
                  <p className="text-gray-600 mb-6">{error}</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 font-semibold"
                  >
                    다시 시도하기
                  </button>

                  <Link
                    href="/"
                    className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 font-semibold"
                  >
                    메인으로 돌아가기
                  </Link>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                  <p>문제가 지속되면 잠시 후 다시 시도해주세요.</p>
                </div>
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
          background:
            "linear-gradient(135deg, rgba(102, 126, 234, 1) 0%, rgba(118, 75, 162, 1) 50%, rgba(245, 87, 108, 1) 100%)",
        }}
      ></div>

      <div className="container mx-auto max-w-screen-xl p-4 lg:p-8 mt-0">
        <div className="grid grid-cols-12 gap-8">
          <main className="col-span-12 lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <header className="pb-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-lg font-bold text-gray-700">
                  {newsData.source || "알 수 없음"}
                </span>
                <span className="text-gray-400">•</span>
                <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-2 py-0.5 rounded-full">
                  {newsData.category || "일반"}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                {newsData.title || "제목 없음"}
              </h1>
              <div className="flex justify-between items-center text-gray-600 text-sm">
                <p className="flex items-center">
                  <User className="w-4 h-4 mr-1.5" />
                  {newsData.reporterName || "알 수 없음"} 기자
                </p>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center text-sm mr-2 text-black">
                    <Clock className="h-4 w-4 mr-1" />
                    {newsData.publishedAt
                      ? new Date(newsData.publishedAt).toLocaleDateString(
                          "ko-KR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "날짜 없음"}
                  </span>
                </div>
              </div>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    addScrap(newsData);
                    toast.success("기사가 스크랩되었습니다.");
                  }}
                  className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <Bookmark size={18} />
                  <span>스크랩</span>
                </button>
                <button
                  onClick={() => setSummaryModalOpen(true)}
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
                {/* ✨ 2. 글자 크기 버튼을 '가가' 모양의 최종 버전으로 교체 */}
                <div className="relative">
                  <NaverFontButtonV2
                    onClick={() => setFontSizeSelectorOpen((prev) => !prev)}
                  />
                  {isFontSizeSelectorOpen && (
                    <FontSizeSelector
                      currentValue={fontSize}
                      onSelect={setFontSize}
                      onClose={() => setFontSizeSelectorOpen(false)}
                    />
                  )}
                </div>

                <button
                  onClick={() => setShareModalOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-full hover:shadow-md transition-all duration-200"
                >
                  <Share className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => toast.info("기사가 신고되었습니다.")}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                  <Siren className="w-6 h-6 text-red-500" />
                </button>
              </div>
            </div>

            {newsData.image && (
              <div className="my-6">
                <img
                  src={newsData.image}
                  alt={newsData.title || "뉴스 이미지"}
                  className="w-full max-h-[400px] object-cover rounded-xl mx-auto"
                  onError={(e) => {
                    e.target.src = "/placeholder.jpg";
                  }}
                />
              </div>
            )}

            <article
              className="prose prose-lg max-w-none text-lg leading-relaxed text-gray-800"
              style={{ fontSize: `${fontSize}px` }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: newsData.content || "내용이 없습니다.",
                }}
              />
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
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (newComment.trim() === "") {
                            toast.error("댓글 내용을 입력해주세요.");
                            return;
                          }
                          const comment = {
                            id: Date.now(),
                            author: "나",
                            avatar:
                              "https://placehold.co/40x40/E2E8F0/4A5568?text=나",
                            text: newComment,
                            time: "방금 전",
                          };
                          setComments([comment, ...comments]);
                          setNewComment("");
                          toast.success("댓글이 등록되었습니다.");
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newComment.trim() === "") {
                          toast.error("댓글 내용을 입력해주세요.");
                          return;
                        }
                        const comment = {
                          id: Date.now(),
                          author: "나",
                          avatar:
                            "https://placehold.co/40x40/E2E8F0/4A5568?text=나",
                          text: newComment,
                          time: "방금 전",
                        };
                        setComments([comment, ...comments]);
                        setNewComment("");
                        toast.success("댓글이 등록되었습니다.");
                      }}
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

          <aside className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border">
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
            <div className="bg-white p-6 rounded-2xl shadow-lg border">
              <h3 className="text-xl font-bold border-b pb-3 mb-4">
                랭킹 뉴스
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
                  onClick={() => {
                    if (newsData) {
                      const currentUrl = window.location.href;
                      const textarea = document.createElement("textarea");
                      textarea.value = currentUrl;
                      document.body.appendChild(textarea);
                      textarea.select();
                      try {
                        document.execCommand("copy");
                        toast.success("URL이 복사되었습니다.");
                      } catch (err) {
                        console.error("Failed to copy text:", err);
                        toast.error("URL 복사에 실패했습니다.");
                      } finally {
                        document.body.removeChild(textarea);
                      }
                    }
                  }}
                  className="bg-indigo-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-indigo-600 transition-colors"
                >
                  복사
                </button>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    if (newsData) {
                      const currentUrl = window.location.href;
                      const textarea = document.createElement("textarea");
                      textarea.value = currentUrl;
                      document.body.appendChild(textarea);
                      textarea.select();
                      try {
                        document.execCommand("copy");
                        toast.info(
                          "카카오톡 공유는 SDK 연동이 필요합니다. 기사 URL이 복사되었습니다."
                        );
                      } catch (err) {
                        console.error("Failed to copy text:", err);
                        toast.error("URL 복사에 실패했습니다.");
                      } finally {
                        document.body.removeChild(textarea);
                      }
                    }
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FEE500] hover:opacity-80 transition-opacity"
                >
                  <img
                    src="/images/Kakaotalk.png"
                    alt="카카오톡"
                    className="w-8 h-8"
                  />
                </button>
                <button
                  onClick={() => {
                    if (newsData) {
                      const currentUrl = window.location.href;
                      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        currentUrl
                      )}&quote=${encodeURIComponent(newsData.title)}`;
                      window.open(shareUrl, "_blank", "width=600,height=400");
                    }
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-[#1877F2] hover:opacity-80 transition-opacity"
                >
                  <img
                    src="/images/Facebook.png"
                    alt="페이스북"
                    className="w-8 h-8"
                  />
                </button>
                <button
                  onClick={() => {
                    if (newsData) {
                      const currentUrl = window.location.href;
                      const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                        currentUrl
                      )}&text=${encodeURIComponent(newsData.title)}`;
                      window.open(shareUrl, "_blank", "width=600,height=400");
                    }
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200 hover:opacity-80 transition-opacity"
                >
                  <img
                    src="/images/Twitter.png"
                    alt="트위터"
                    className="w-8 h-8"
                  />
                </button>
                <button
                  onClick={() => {
                    if (newsData) {
                      const currentUrl = window.location.href;
                      const textarea = document.createElement("textarea");
                      textarea.value = currentUrl;
                      document.body.appendChild(textarea);
                      textarea.select();
                      try {
                        document.execCommand("copy");
                        toast.info(
                          "인스타그램은 웹에서 직접 공유하기 어렵습니다. 기사 URL이 복사되었습니다."
                        );
                      } catch (err) {
                        console.error("Failed to copy text:", err);
                        toast.error("URL 복사에 실패했습니다.");
                      } finally {
                        document.body.removeChild(textarea);
                      }
                    }
                  }}
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
