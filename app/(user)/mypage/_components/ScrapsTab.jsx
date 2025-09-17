'use client';

import React, { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Bookmark,
  Share,
  Calendar,
  FolderPlus,
  Search,
  X,
  BookOpen,
  Trash2
} from "lucide-react";
import { useScrap } from "@/contexts/ScrapContext";
import Link from "next/link";
import Image from 'next/image';
import AddToCollectionModal from "./AddToCollectionModal";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// 공유 모달 컴포넌트
const ShareModal = ({ isOpen, onClose, newsData }) => {
  if (!isOpen || !newsData) return null;
  const newsUrl = `${window.location.origin}/news/${newsData.newsId}`;
  const copyUrl = () => {
    navigator.clipboard.writeText(newsUrl).then(() => toast.success("URL이 복사되었습니다.")).catch(() => toast.error("URL 복사에 실패했습니다."));
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

const ScrapSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 flex gap-4 items-start">
            <div className="w-10 h-5 bg-gray-200 rounded animate-pulse mt-1"></div>
            <div className="w-40 h-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
      ))}
    </div>
);

const categories = ["전체","정치", "경제", "사회", "생활", "세계", "IT/과학", "자동차/교통", "여행/음식", "예술"];

export default function ScrapsTab() {
  const {
    scraps,
    isLoading,
    error,
    removeScrap,
    selectedCategory,
    handleCategoryChange,
    currentPage,
    totalPages,
    setCurrentPage,
    searchQuery,
    handleSearch,
  } = useScrap();

  const [isAddToCollectionModalOpen, setAddToCollectionModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [inputQuery, setInputQuery] = useState(searchQuery);
  const [selectedScraps, setSelectedScraps] = useState(new Set());
  const [modalNewsItems, setModalNewsItems] = useState([]);
  const [scrapToDelete, setScrapToDelete] = useState(null); // 삭제할 스크랩 ID 상태

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (inputQuery !== searchQuery) {
        handleSearch(inputQuery);
      }
    }, 500);
    return () => clearTimeout(timerId);
  }, [inputQuery, searchQuery, handleSearch]);

  useEffect(() => {
    setSelectedScraps(new Set());
  }, [selectedCategory, currentPage]);

  const handleOpenShareModal = (news) => {
    setSelectedNews(news);
    setShareModalOpen(true);
  };

  const handleScrapSelection = (newsId) => {
    setSelectedScraps(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(newsId)) {
        newSelection.delete(newsId);
      } else {
        newSelection.add(newsId);
      }
      return newSelection;
    });
  };

  const openCollectionModal = (newsItems) => {
    setModalNewsItems(newsItems);
    setAddToCollectionModalOpen(true);
  };

  const closeCollectionModal = () => {
    setAddToCollectionModalOpen(false);
    setModalNewsItems([]);
    setSelectedScraps(new Set());
  };

  const handleDeleteClick = (newsId) => {
    setScrapToDelete(newsId);
  };

  const confirmDelete = () => {
    if (scrapToDelete) {
      removeScrap(scrapToDelete);
      setScrapToDelete(null);
    }
  };

  const renderContent = () => {
    if (isLoading) return <ScrapSkeleton />;
    if (error) return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <Bookmark className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-semibold">스크랩 목록을 불러올 수 없습니다</h3>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="mt-4"
        >
          다시 시도
        </Button>
      </div>
    );
    if (scraps.length === 0) return <div className="text-gray-500 text-center py-12"><Bookmark className="h-12 w-12 mx-auto text-gray-400 mb-4" /><h3 className="text-lg font-semibold">{searchQuery ? "검색 결과가 없습니다." : (selectedCategory === "전체" ? "스크랩한 기사가 없습니다." : `'${selectedCategory}' 카테고리의 스크랩이 없습니다.`)}</h3><p className="text-sm text-gray-600 mt-1">{searchQuery ? "다른 검색어로 다시 시도해보세요." : "관심 있는 기사를 스크랩하여 나중에 다시 읽어보세요."}</p></div>;

    return (
        <div className="space-y-4">
          {scraps.map((news) => (
              <div key={news.newsId} className={`border rounded-lg p-4 transition-all duration-200 flex gap-4 items-start ${selectedScraps.has(news.newsId) ? 'bg-indigo-50 shadow-md' : 'hover:shadow-md'}`}>
                <Checkbox
                    id={`select-${news.newsId}`}
                    checked={selectedScraps.has(news.newsId)}
                    onCheckedChange={() => handleScrapSelection(news.newsId)}
                    className="mt-1 flex-shrink-0"
                />
                <Link href={`/news/${news.newsId}`} className="block w-40 h-auto self-stretch flex-shrink-0">
                  <div className="relative w-full h-full rounded-md overflow-hidden border">
                    <Image
                        src={news.imageUrl || '/placeholder.svg'}
                        alt={news.title}
                        fill
                        className="object-cover"
                    />
                  </div>
                </Link>
                <div className="flex-1 flex flex-col justify-between self-stretch">
                  <div>
                    <Link href={`/news/${news.newsId}`} className="font-semibold text-lg hover:text-indigo-600 transition-colors cursor-pointer line-clamp-2">
                      {news.title}
                    </Link>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-2">
                      <span>{news.press}</span>
                      <Badge variant="secondary">{news.categoryName}</Badge>
                      {news.scrapedAt && <span className="flex items-center"><Calendar className="h-4 w-4 mr-1.5 text-gray-500" />{new Date(news.scrapedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenShareModal(news)}>
                      <Share className="h-4 w-4 mr-1" />
                      공유
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCollectionModal([{ newsId: news.newsId, title: news.title }])}
                        disabled={selectedScraps.size > 0}
                    >
                      <FolderPlus className="h-4 w-4 mr-1" />
                      컬렉션에 추가
                    </Button>
                    <Link href={`/news/${news.newsId}`} passHref legacyBehavior>
                      <Button variant="outline" size="sm" as="a">
                        <BookOpen className="h-4 w-4 mr-1" />
                        읽기
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteClick(news.newsId)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
              </div>
          ))}
          {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                          href="#"
                          onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(0, p - 1)); }}
                          aria-disabled={currentPage === 0}
                          className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {[...Array(totalPages).keys()].map(pageNumber => (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                              href="#"
                              onClick={(e) => { e.preventDefault(); setCurrentPage(pageNumber); }}
                              isActive={currentPage === pageNumber}
                          >
                            {pageNumber + 1}
                          </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                          href="#"
                          onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages - 1, p + 1)); }}
                          aria-disabled={currentPage >= totalPages - 1}
                          className={currentPage >= totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
          )}
        </div>
    );
  };

  return (
      <>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center"><Bookmark className="h-5 w-5 mr-2" />스크랩한 기사</CardTitle>
                <CardDescription className="mt-2">기사를 선택하여 컬렉션에 추가할 수 있습니다.</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                    onClick={() => {
                      const selectedItems = scraps
                        .filter(scrap => selectedScraps.has(scrap.newsId))
                        .map(scrap => ({ newsId: scrap.newsId, title: scrap.title }));
                      openCollectionModal(selectedItems);
                    }}
                    disabled={selectedScraps.size === 0}
                >
                  <FolderPlus className="mr-2 h-4 w-4" />
                  {selectedScraps.size > 0 ? `선택한 ${selectedScraps.size}개의 기사 컬렉션에 추가` : "컬렉션에 추가"}
                </Button>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input placeholder="제목으로 검색" className="pl-10" value={inputQuery} onChange={(e) => setInputQuery(e.target.value)} />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="lg:w-full overflow-x-auto flex-wrap flex items-center justify-between space-x-1 pb-4">
              {categories.map((category) => (
                  <Button key={category} variant={selectedCategory === category ? "default" : "outline"} size="default" onClick={() => handleCategoryChange(category)} className="whitespace-nowrap hover-lift text-base px-4 py-2">{category}</Button>
              ))}
            </div>
            {renderContent()}
          </CardContent>
        </Card>

        <AlertDialog open={scrapToDelete !== null} onOpenChange={(isOpen) => !isOpen && setScrapToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>스크랩 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                        이 기사를 스크랩에서 삭제하시겠습니까? 삭제 시 컬렉션에 있는 기사도 같이 삭제됩니다.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setScrapToDelete(null)}>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">삭제</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {isAddToCollectionModalOpen && (
            <AddToCollectionModal
                isOpen={isAddToCollectionModalOpen}
                onClose={closeCollectionModal}
                newsItems={modalNewsItems}
                onSuccess={closeCollectionModal}
            />
        )}
        {selectedNews && <ShareModal isOpen={isShareModalOpen} onClose={() => setSelectedNews(null)} newsData={selectedNews} />}
      </>
  );
}