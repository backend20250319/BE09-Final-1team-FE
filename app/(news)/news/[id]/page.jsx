"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// UI & 아이콘 라이브러리
import { Toaster, toast } from "sonner";
import {
  User, Clock, Bookmark, Bot, Share, Siren, X, LogIn, ShieldAlert
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// 서비스 및 커스텀 훅

import { newsService } from "@/lib/newsService";
import { useScrap } from "@/contexts/ScrapContext";
import useSummary from '../../../../hooks/useSummary';
import RelatedNewsCard from "@/components/RelatedNewsCard"; // Added import


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
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
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
    router.push('/auth');
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
              이 기능을 사용하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?
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
  { id: 'FAKE_NEWS', label: '허위 정보 / 가짜뉴스' },
  { id: 'SPAM', label: '광고 / 스팸' },
  { id: 'HATE_SPEECH', label: '욕설 / 혐오 발언' },
  { id: 'COPYRIGHT', label: '저작권 침해' },
  { id: 'OTHER', label: '기타' },
];

// 요약 버튼/모달/훅 사용
import AiSummaryButton from "@/components/aisummarybot/AiSummaryButton";
import AiSummaryModal from "@/components/aisummarybot/AiSummaryModal";
import useSummary from "../../../../hooks/useSummary";

import Link from "next/link";
import { Share, X, User, Clock, Siren, Bookmark } from "lucide-react";
import { Toaster, toast } from "sonner";

const ReportModal = ({ isOpen, onClose, newsId }) => {
    const [reason, setReason] = useState(reportReasons[0].id);
    const [details, setDetails] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const handleReportClick = () => {
        setIsConfirmModalOpen(true);
    };

  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);

    try {
      const authToken = localStorage.getItem('accessToken');
      const response = await fetch(`/api/news/${newsId}/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, details }),
      });

      if (response.ok) {
        toast.success('기사가 정상적으로 신고되었습니다.');
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({ message: '서버 응답을 파싱할 수 없습니다.' }));
        toast.error(errorData.message || '신고 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error during report:', error);
      toast.error('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
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
                신고하려는 이유를 선택해주세요. 허위 신고 시 서비스 이용에 제한을 받을 수 있습니다.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <RadioGroup defaultValue={reason} onValueChange={setReason} className="space-y-2">
                {reportReasons.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={item.id} id={`reason-${item.id}`} />
                      <Label htmlFor={`reason-${item.id}`}>{item.label}</Label>
                    </div>
                ))}
              </RadioGroup>
              {reason === 'OTHER' && (
                  <Textarea placeholder="상세한 신고 내용을 입력해주세요." value={details} onChange={(e) => setDetails(e.target.value)} />
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">취소</Button>
              </DialogClose>
              <Button type="button" variant="destructive" onClick={handleReportClick} disabled={isLoading}>
                {"신고하기"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>신고 확인</DialogTitle>
              <DialogDescription>
                정말 신고하시겠습니까?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>
                아니오
              </Button>
              <Button variant="destructive" onClick={handleConfirmSubmit} disabled={isLoading}>
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
                          currentValue === sizeOption.value && "font-bold text-indigo-500"
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

export default function NewsPage() {
  const params = useParams();
  const articleId = params?.id;

  const { addScrap } = useScrap();
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontSize, setFontSize] = useState(18);
  const [isFontSizeSelectorOpen, setFontSizeSelectorOpen] = useState(false);

  /* 가져올 뉴스데이터 id 및 State 설정 */
  const newsId = Number(params.id);

  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "김민준",
      avatar: "https://placehold.co/40x40/C7D2FE/4338CA?text=김",
      text:
          "정책의 방향성은 좋다고 생각합니다. 다만, 실행 과정에서 중소기업들에게 실질적인 혜택이 돌아갈 수 있도록 세심한 관리가 필요해 보여요.",
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

  // 요약 훅(요약 표시 + 복사만 사용)
  const {
    data: summaryData,
    loading: summaryLoading,
    error: summaryError,
    requestSummary,
    reset: resetSummary,
  } = useSummary();

  // 요약 모달 열기 (열 때 id 기반으로 요청)
  const openSummary = useCallback(async () => {
    setSummaryModalOpen(true);
    await requestSummary({ newsId }); // id로 요약(캐시 재사용)
  }, [newsId, requestSummary]);

// 다시 요약(재생성) - 관리자만 버튼 노출/사용 권장
  const regenerateSummary = useCallback(async () => {
    await requestSummary({ newsId, force: true }); // 캐시 무시 재생성
  }, [newsId, requestSummary]);

// 요약 복사 summaryData?.summary 사용
  const copySummary = useCallback(async () => {
    const text = summaryData?.summary || "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("요약이 복사되었습니다.");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast.success("요약이 복사되었습니다.");
    }
  }, [summaryData?.summary]);

  useEffect(() => {
    const loadNewsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/news-detail?id=${articleId}`);
        if (!response.ok) throw new Error(`뉴스를 불러올 수 없습니다. (${response.status})`);

        const data = await response.json();
        if (!data || !data.title) throw new Error("뉴스 데이터가 올바르지 않습니다.");

        const rawCategory = data.category || "일반";
        const convertedCategory = backendToFrontendCategory[rawCategory] || rawCategory;

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

        // 조회 기록
        try {
          await newsService.recordNewsView(articleId);
        } catch (viewErr) {
          // 조회 기록 실패는 무시
        }
      } catch (err) {
        setError(err.message || "뉴스를 불러올 수 없습니다.");
        setNewsData(null);
      } finally {
        setLoading(false);
      }
    };

    if (articleId) loadNewsData();

    const handleScroll = () => {
      const totalHeight =
          document.documentElement.scrollHeight - document.documentElement.clientHeight;
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
                      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                      </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">뉴스를 불러올 수 없습니다</h1>
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

        {/* 상단 읽기 진행바 */}
        <div
            className="fixed top-16 left-0 h-2 z-[60] transition-all duration-100 ease-out shadow-sm"
            style={{
              width: `${readingProgress}%`,
              background:
                  "linear-gradient(135deg, rgba(102, 126, 234, 1) 0%, rgba(118, 75, 162, 1) 50%, rgba(245, 87, 108, 1) 100%)",
            }}
        />

        <div className="container mx-auto max-w-screen-xl p-4 lg:p-8 mt-0">
          <div className="grid grid-cols-12 gap-8">
            <main className="col-span-12 lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
              {/* 헤더 영역 */}
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
                        ? new Date(newsData.publishedAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "날짜 없음"}
                  </span>
                  </div>
                </div>
              </header>

              {/* 상단 버튼들 */}
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

                  {/* 요약 버튼 (모달 열고 요약 호출) */}
                  <AiSummaryButton onClick={openSummary} />
                </div>

                <div className="flex items-center gap-2">
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

              {/* 이미지 */}
              {newsData.image && (
                  <div className="my-6">
                    <img
                        src={newsData.image}
                        alt={newsData.title || "뉴스 이미지"}
                        className="w-full max-h-[400px] object-cover rounded-xl mx-auto"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.jpg";
                        }}
                    />
                  </div>
              )}

              {/* 본문 */}
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

              {/* 태그 */}
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

              {/* 관련/댓글 (기존 유지) */}
              <section className="mt-12 pt-8 border-t">
                <h2 className="text-2xl font-bold mb-6">함께 보면 좋은 뉴스</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedNews.map((news) => (
                      <Link href={`/news/${news.id}`} key={news.id} className="block group">
                        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <p className="text-indigo-600 font-semibold text-sm mb-1">{news.category}</p>
                          <h4 className="font-bold group-hover:text-indigo-700">{news.title}</h4>
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
                        rows={3}
                        placeholder="의견을 나눠보세요..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (!newComment.trim()) {
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
                          }
                        }}
                    />
                      <button
                          onClick={() => {
                            if (!newComment.trim()) {
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
                          <img src={comment.avatar} alt={`${comment.author} 프로필`} className="w-10 h-10 rounded-full" />
                          <div className="flex-1 bg-gray-100 p-4 rounded-lg">
                            <p className="font-semibold">{comment.author}</p>
                            <p className="text-gray-700 mt-1">{comment.text}</p>
                            <p className="text-xs text-gray-500 mt-2">{comment.time}</p>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </section>
            </main>

            {/* 우측 사이드바 */}
            <aside className="col-span-12 lg:col-span-4 space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border">
                <h3 className="text-xl font-bold border-b pb-3 mb-4">헤드라인 뉴스</h3>
                <ul className="space-y-3">
                  {headlineNews.map(news => (
                      <li key={news.id}><Link href={`/news/${news.id}`} className="hover:text-indigo-600">{news.title}</Link></li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border">
                <h3 className="text-xl font-bold border-b pb-3 mb-4">랭킹 뉴스</h3>
                <ul className="space-y-3">
                  {rankingNews.map((news, index) => (
                      <li key={news.id} className="flex items-center">
                        <span className="text-lg font-bold text-indigo-600 w-6">{index + 1}</span>
                        <Link href={`/news/${news.id}`} className="hover:text-indigo-600 flex-1">{news.title}</Link>
                      </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>

          {/* 요약 모달: 요약 텍스트만 노출 + 복사 버튼 */}
          {isSummaryModalOpen && (
              <AiSummaryModal
                  data={summaryData}          // { summary, cached, stale, ... }
                  loading={summaryLoading}
                  error={summaryError}
                  onClose={() => {
                      setSummaryModalOpen(false);
                      resetSummary();           // 닫을 때 상태 초기화(선택)
                  }}
                  onRegenerate={regenerateSummary} // "다시 생성" 버튼 동작
                  // contentOnly   // ← 헤더/버튼 없이 텍스트만 보여주고 싶으면 이 줄을 활성화
              />
          )}

        {/* 공유 모달(기존 유지) */}
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
                  <button onClick={() => setShareModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">아래 링크를 복사하거나 SNS로 공유할 수 있습니다.</p>
                  <div className="flex items-center border rounded-lg p-2 bg-gray-50 mb-4">
                    <input
                        type="text"
                        value={typeof window !== "undefined" ? window.location.href : "#"}
                        className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                        readOnly
                    />
                    <button
                        onClick={() => {
                          const currentUrl = window.location.href;
                          const textarea = document.createElement("textarea");
                          textarea.value = currentUrl;
                          document.body.appendChild(textarea);
                          textarea.select();
                          try {
                            document.execCommand("copy");
                            toast.success("URL이 복사되었습니다.");
                          } catch (err) {
                            toast.error("URL 복사에 실패했습니다.");
                          } finally {
                            document.body.removeChild(textarea);
                          }
                        }}
                        className="bg-indigo-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-indigo-600 transition-colors"
                    >
                      복사
                    </button>
                  </div>

                  <div className="flex justify-center gap-4">
                    {/* SNS 버튼들 (그대로 유지) */}
                    <button
                        onClick={() => {
                          const currentUrl = window.location.href;
                          const textarea = document.createElement("textarea");
                          textarea.value = currentUrl;
                          document.body.appendChild(textarea);
                          textarea.select();
                          try {
                            document.execCommand("copy");
                            toast.info("카카오톡 공유는 SDK 연동이 필요합니다. 기사 URL이 복사되었습니다.");
                          } catch {
                            toast.error("URL 복사에 실패했습니다.");
                          } finally {
                            document.body.removeChild(textarea);
                          }
                        }}
                        className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FEE500] hover:opacity-80 transition-opacity"
                    >
                      <img src="/images/Kakaotalk.png" alt="카카오톡" className="w-8 h-8" />
                    </button>

                    <button
                        onClick={() => {
                          const currentUrl = window.location.href;
                          const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                              currentUrl
                          )}&quote=${encodeURIComponent(newsData.title)}`;
                          window.open(shareUrl, "_blank", "width=600,height=400");
                        }}
                        className="w-12 h-12 rounded-full flex items-center justify-center bg-[#1877F2] hover:opacity-80 transition-opacity"
                    >
                      <img src="/images/Facebook.png" alt="페이스북" className="w-8 h-8" />
                    </button>

                    <button
                        onClick={() => {
                          const currentUrl = window.location.href;
                          const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                              currentUrl
                          )}&text=${encodeURIComponent(newsData.title)}`;
                          window.open(shareUrl, "_blank", "width=600,height=400");
                        }}
                        className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200 hover:opacity-80 transition-opacity"
                    >
                      <img src="/images/Twitter.png" alt="트위터" className="w-8 h-8" />
                    </button>

                    <button
                        onClick={() => {
                          const currentUrl = window.location.href;
                          const textarea = document.createElement("textarea");
                          textarea.value = currentUrl;
                          document.body.appendChild(textarea);
                          textarea.select();
                          try {
                            document.execCommand("copy");
                            toast.info("인스타그램은 웹에서 직접 공유하기 어렵습니다. 기사 URL이 복사되었습니다.");
                          } catch {
                            toast.error("URL 복사에 실패했습니다.");
                          } finally {
                            document.body.removeChild(textarea);
                          }
                        }}
                        className="w-12 h-12 rounded-full flex items-center justify-center bg-[#E4405F] hover:opacity-80 transition-opacity"
                    >
                      <img src="/images/Instagram.png" alt="인스타그램" className="w-8 h-8" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </>
  );
}
