'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from "sonner";
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Trash2, Newspaper, CalendarDays, BookMarked, Share, Search, X, BookOpen, Pencil, Check, XCircle, PlusSquare, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import AddScrapsToCollectionModal from './AddScrapsToCollectionModal';
import AddToCollectionModal from '../../_components/AddToCollectionModal';

const ShareModal = ({ isOpen, onClose, newsData }) => {
  if (!isOpen || !newsData) return null;
  const newsUrl = `${window.location.origin}/news/${newsData.newsId}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(newsUrl)
    .then(() => toast.success("URL이 복사되었습니다."))
    .catch(() => toast.error("URL 복사에 실패했습니다."));
  };

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">기사 공유하기</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">아래 링크를 복사하여 공유할 수 있습니다.</p>
            <div className="flex items-center border rounded-lg p-2 bg-gray-50 mb-4">
              <input type="text" value={newsUrl} className="flex-1 bg-transparent outline-none text-sm text-gray-700" readOnly />
              <Button onClick={copyUrl}>복사</Button>
            </div>
          </div>
        </div>
      </div>
  );
};

const NewsCardSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden bg-white animate-pulse">
            <div className="w-full h-40 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-5 bg-gray-200 rounded w-full mb-3"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
      ))}
    </div>
);

const backendToFrontendCategory = {
    POLITICS: "정치", ECONOMY: "경제", SOCIETY: "사회", LIFE: "생활", INTERNATIONAL: "세계", IT_SCIENCE: "IT/과학", VEHICLE : '자동차/교통', TRAVEL_FOOD : '여행/음식', ART : '예술'
};

const NewsCard = ({ news, onRemove, onShare, onAddToCollection }) => {
  const press = news.press || '정보 없음';
  const rawCategory = news.categoryName;
  const category = backendToFrontendCategory[rawCategory] || rawCategory || '기타';
  const displayDate = news.published_at;
  const imageSrc = news.imageUrl || '/placeholder.svg';

  return (
      <Card className="overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md">
        <div className="relative w-full h-40">
          <Link href={`/news/${news.newsId}`} className="block w-full h-full">
            <Image
                src={imageSrc}
                alt={news.title}
                fill
                className="object-cover"
            />
          </Link>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex-grow">
            <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                    <span>{press}</span>
                    <Badge variant="secondary">{category}</Badge>
                </div>
                {/*<div className="text-xs text-gray-500 flex items-center flex-shrink-0">*/}
                {/*    <CalendarDays className="h-4 w-4 mr-1" />*/}
                {/*    <span>{formattedDate}</span>*/}
                {/*</div>*/}
            </div>
            <Link href={`/news/${news.newsId}`} className="font-semibold text-base hover:text-indigo-600 transition-colors cursor-pointer line-clamp-2">
              {news.title}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4">
            <Link href={`/news/${news.newsId}`} passHref legacyBehavior>
              <Button variant="outline" size="sm" as="a">
                <BookOpen className="mr-2 h-4 w-4" /> 읽기
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => onShare(news)}>
              <Share className="mr-2 h-4 w-4" /> 공유
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAddToCollection([news.newsId])}>
              <FolderPlus className="mr-2 h-4 w-4" /> 추가
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="mr-2 h-4 w-4" /> 삭제
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>컬렉션에서 삭제</AlertDialogTitle>
                  <AlertDialogDescription>이 기사를 컬렉션에서 삭제하시겠습니까? 스크랩 목록에는 그대로 유지됩니다.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onRemove(news.newsId)} className="bg-red-600 hover:bg-red-700">삭제</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>
  );
};

const categories = ["전체", "정치", "경제", "사회", "생활", "세계", "IT/과학", "자동차/교통", "여행/음식", "예술"];

// --- 메인 페이지 컴포넌트 ---
const CollectionDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.collectionId;

  const [collectionInfo, setCollectionInfo] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [inputQuery, setInputQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [selectedNewsForShare, setSelectedNewsForShare] = useState(null);

  // 이름 변경 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");

  // 스크랩 추가 모달 상태
  const [isAddScrapsModalOpen, setAddScrapsModalOpen] = useState(false);
  // 단일 뉴스 추가 모달 상태
  const [isAddToCollectionModalOpen, setAddToCollectionModalOpen] = useState(false);
  const [modalNewsIds, setModalNewsIds] = useState([]);

  const fetchData = useCallback(async (page, category, query) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
      setIsLoading(false);
      setTimeout(() => router.push('/auth'), 2000);
      return;
    }

    setIsLoading(true);
    try {
      // 컬렉션 정보는 한 번만 불러오도록 최적화
      if (!collectionInfo) {
        const infoResponse = await fetch(`/api/news/collections/${collectionId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!infoResponse.ok) throw new Error('컬렉션 정보를 불러오는데 실패했습니다.');
        const infoData = await infoResponse.json();
        setCollectionInfo(infoData);
        setEditedName(infoData.storageName);
      }

      const urlParams = new URLSearchParams({ page: String(page), size: '12' });
      if (query) urlParams.append('query', query);
      if (category && category !== "전체") urlParams.append('category', category);

      const newsResponse = await fetch(`/api/news/collections/${collectionId}/news?${urlParams.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!newsResponse.ok) throw new Error('컬렉션의 기사 목록을 불러오는데 실패했습니다.');
      const newsData = await newsResponse.json();
      setNewsList(newsData.content || []);
      setPageInfo(newsData);

    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [collectionId, router, collectionInfo]);

  useEffect(() => {
    if (collectionId) {
      fetchData(currentPage, selectedCategory, searchQuery);
    }
  }, [collectionId, currentPage, selectedCategory, searchQuery, fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputQuery);
      setCurrentPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputQuery]);

  const handleUpdateCollectionName = async () => {
    if (!editedName.trim()) {
      toast.error("컬렉션 이름은 비워둘 수 없습니다.");
      return;
    }
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`/api/news/collections/${collectionId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ storageName: editedName })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "이름 변경에 실패했습니다.");
      }

      const updatedInfo = await response.json();
      setCollectionInfo(updatedInfo);
      toast.success("컬렉션 이름이 변경되었습니다.");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemoveArticle = async (newsId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) { toast.error("로그인이 필요합니다."); return; }

    try {
      const response = await fetch(`/api/news/collections/${collectionId}/news/${newsId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("기사 삭제에 실패했습니다.");

      toast.success("컬렉션에서 기사를 삭제했습니다.");
      // 현재 페이지 데이터 다시 로드
      fetchData(currentPage, selectedCategory, searchQuery);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setInputQuery("");
    setSearchQuery("");
    setCurrentPage(0);
  };

  const handleOpenShareModal = (news) => {
    setSelectedNewsForShare(news);
    setShareModalOpen(true);
  };

  const openAddScrapsModal = () => setAddScrapsModalOpen(true);
  const closeAddScrapsModal = () => setAddScrapsModalOpen(false);

  const openAddToCollectionModal = (newsIds) => {
    setModalNewsIds(newsIds);
    setAddToCollectionModalOpen(true);
  };
  const closeAddToCollectionModal = () => {
    setAddToCollectionModalOpen(false);
    setModalNewsIds([]);
  };

  // 기사 추가 성공 시 데이터 새로고침 (첫 페이지로 이동)
  const handleAddSuccess = () => {
    fetchData(0, '전체', '');
    setCurrentPage(0);
    setSelectedCategory('전체');
    setSearchQuery('');
    setInputQuery('');
  }

  return (
      <>
        <ShareModal isOpen={isShareModalOpen} onClose={() => setShareModalOpen(false)} newsData={selectedNewsForShare} />
        <AddScrapsToCollectionModal isOpen={isAddScrapsModalOpen} onClose={closeAddScrapsModal} collectionId={collectionId} onSuccess={handleAddSuccess} />
        {isAddToCollectionModalOpen && (
            <AddToCollectionModal
                isOpen={isAddToCollectionModalOpen}
                onClose={closeAddToCollectionModal}
                newsIds={modalNewsIds}
                onSuccess={closeAddToCollectionModal}
            />
        )}

        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
              <Link href="/mypage" className="inline-flex items-center text-base text-gray-600 hover:text-blue-600 transition-colors font-semibold">
                <ArrowLeft className="w-5 h-5 mr-2" />
                마이페이지로 돌아가기
              </Link>
            </div>

            {isLoading && !collectionInfo && <div className="text-center py-20 text-lg font-semibold"></div>}
            {error && <div className="text-center py-20 text-red-600">{error}</div>}

            {!isLoading && !error && collectionInfo && (
                <>
                  <header className="mb-6 pb-4 border-b">
                    <div className="flex flex-col md:flex-row justify-between md:items-center">
                      <div className="flex-grow">
                        {!isEditing ? (
                            <div className="flex items-center gap-3">
                              <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">{collectionInfo.storageName}</h1>
                              <Button variant="ghost" size="icon" onClick={() => { setIsEditing(true); setEditedName(collectionInfo.storageName); }}>
                                <Pencil className="w-6 h-6" />
                              </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                              <Input
                                  value={editedName}
                                  onChange={(e) => setEditedName(e.target.value)}
                                  className="flex-1 text-4xl font-extrabold"
                              />
                              <Button size="icon" onClick={handleUpdateCollectionName}><Check className="w-6 h-6" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => { setIsEditing(false); setEditedName(collectionInfo.storageName); }}><XCircle className="w-6 h-6" /></Button>
                            </div>
                        )}
                        <div className="flex items-center gap-6 mt-4 text-base text-gray-500">
                          <div className="flex items-center gap-2"><Newspaper className="w-5 h-5" /><span>기사 {pageInfo ? pageInfo.totalElements : 0}개</span></div>
                          <div className="flex items-center gap-2"><CalendarDays className="w-5 h-5" /><span>생성일 : {new Date(collectionInfo.createdAt).toLocaleDateString()}</span></div>
                        </div>
                      </div>
                      <div className="relative w-full md:w-72 mt-4 md:mt-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input placeholder="기사 검색" className="pl-10" value={inputQuery} onChange={(e) => setInputQuery(e.target.value)} />
                      </div>
                    </div>
                  </header>

                  <div className="my-6">
                    <div className="flex justify-between items-center gap-2">
                      <div className="w-full overflow-x-auto">
                        <div className="flex space-x-2">
                          {categories.map((cat) => (
                              <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} onClick={() => handleCategoryChange(cat)} className="whitespace-nowrap">{cat}</Button>
                          ))}
                        </div>
                      </div>
                      <Button onClick={openAddScrapsModal} className="flex-shrink-0">
                        <PlusSquare className="mr-2 h-4 w-4" />
                        기사 추가하기
                      </Button>
                    </div>
                  </div>

                  <main>
                    {isLoading && newsList.length === 0 ? (
                        <NewsCardSkeleton />
                    ) : newsList.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {newsList.map((news) => (
                              <NewsCard
                                  key={news.newsId}
                                  news={news}
                                  onRemove={handleRemoveArticle}
                                  onShare={handleOpenShareModal}
                                  onAddToCollection={openAddToCollectionModal}
                              />
                          ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-24 border-2 border-dashed rounded-xl bg-white">
                          <BookMarked className="mx-auto h-16 w-16 text-gray-400" />
                          <h3 className="mt-4 text-xl font-semibold text-gray-800">표시할 기사가 없습니다.</h3>
                          <p className="mt-2 text-base text-gray-500">
                            {searchQuery || selectedCategory !== '전체' ? '검색 조건에 맞는 기사가 없습니다.' : '이 컬렉션에 추가된 기사가 없습니다.'}
                          </p>
                        </div>
                    )}
                  </main>

                  {pageInfo && pageInfo.totalPages > 1 && (
                      <div className="mt-12 flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(0, p - 1)); }} aria-disabled={pageInfo.first} className={pageInfo.first ? "pointer-events-none opacity-50" : ""} /></PaginationItem>
                            {[...Array(pageInfo.totalPages).keys()].map(pageNumber => (
                                <PaginationItem key={pageNumber}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(pageNumber); }} isActive={currentPage === pageNumber}>{pageNumber + 1}</PaginationLink></PaginationItem>
                            ))}
                            <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(pageInfo.totalPages - 1, p + 1)); }} aria-disabled={pageInfo.last} className={pageInfo.last ? "pointer-events-none opacity-50" : ""} /></PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                  )}
                </>
            )}
          </div>
        </div>
      </>
  );
};

export default CollectionDetailPage;