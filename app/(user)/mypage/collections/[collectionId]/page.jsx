"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from "sonner";
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Trash2, Newspaper, CalendarDays, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // Badge 컴포넌트 임포트
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

const NewsCard = ({ news, onRemove }) => (
    <Card className="transition-shadow hover:shadow-md">
      <div className="grid grid-cols-[auto_1fr] gap-x-4 p-4"> {/* Padding p-2 -> p-4로 변경 */}
        <div className="row-span-2 flex-none w-64 lg:w-80">
          <a href={news.url} target="_blank" rel="noopener noreferrer">
            <Image
                src={news.imageUrl || '/placeholder.svg'}
                alt={news.title}
                width={320}
                height={180}
                className="rounded-lg object-cover aspect-video border"
            />
          </a>
        </div>
        <div className="flex flex-col justify-between py-1"> {/* Added py-1 for vertical spacing */}
          <div>
            {/* 언론사 및 카테고리 */}
            <div className="flex items-center gap-2 mb-1">
              <p className="text-base text-gray-600">{news.press}</p>
              {news.categoryName && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {news.categoryName}
                  </Badge>
              )}
            </div>
            {/* 뉴스 제목 */}
            <a href={news.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              <h3 className="text-xl font-bold text-gray-800 leading-tight line-clamp-2">
                {news.title}
              </h3>
            </a>
          </div>

          {/* 스크랩 날짜 및 삭제 버튼 */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100"> {/* border-t 추가 */}
            <p className="text-sm text-gray-500">
              스크랩: {new Date(news.scrappedAt).toLocaleDateString()}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>이 뉴스를 컬렉션에서 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onRemove(news.newsId)} className="bg-red-600 hover:bg-red-700">삭제</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </Card>
);

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

  const fetchData = useCallback(async (pageToFetch) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
      setIsLoading(false);
      setTimeout(() => router.push('/auth'), 2000);
      return;
    }

    setIsLoading(true);
    try {
      // 컬렉션 정보는 첫 페이지만 가져오거나, 아직 없을 때만 가져옴
      if (pageToFetch === 0 && !collectionInfo) {
        const infoResponse = await fetch(`/api/news/collections/${collectionId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!infoResponse.ok) throw new Error('컬렉션 정보를 불러오는데 실패했습니다.');
        const infoData = await infoResponse.json();
        setCollectionInfo(infoData);
      }

      // 뉴스 목록은 페이지에 따라 새로 가져옴
      const newsResponse = await fetch(`/api/news/collections/${collectionId}/news?page=${pageToFetch}&size=10`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!newsResponse.ok) throw new Error('컬렉션의 뉴스 목록을 불러오는데 실패했습니다.');
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
      fetchData(currentPage);
    }
  }, [collectionId, currentPage, fetchData]);

  const handleRemoveArticle = async (newsId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    try {
      const response = await fetch(`/api/news/collections/${collectionId}/news/${newsId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '뉴스 삭제에 실패했습니다.');
      }
      toast.success("컬렉션에서 뉴스를 삭제했습니다.");
      // 현재 페이지의 데이터 다시 불러오기
      fetchData(currentPage);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 0 && page < pageInfo.totalPages) {
      setCurrentPage(page);
    }
  };

  return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <Link href="/mypage" className="inline-flex items-center text-base text-gray-600 hover:text-blue-600 transition-colors font-semibold">
              <ArrowLeft className="w-5 h-5 mr-2" />
              나의 컬렉션으로 돌아가기
            </Link>
          </div>

          {isLoading && <div className="text-center py-20 text-lg font-semibold">정보를 불러오는 중...</div>}
          {error && <div className="text-center py-20 text-red-600">{error}</div>}

          {!isLoading && !error && collectionInfo && (
              <>
                <header className="mb-10 pb-4">
                  <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-3">{collectionInfo.storageName}</h1>
                  <p className="text-lg text-gray-600 max-w-3xl">{collectionInfo.description || '컬렉션에 대한 설명이 없습니다.'}</p>
                  <div className="flex items-center gap-6 mt-4 text-base text-gray-500">
                    <div className="flex items-center gap-2">
                      <Newspaper className="w-5 h-5" />
                      <span>뉴스 {pageInfo ? pageInfo.totalElements : newsList.length}개</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5" />
                      <span>생성일: {new Date(collectionInfo.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </header>

                <main>
                  {newsList.length > 0 ? (
                      <div className="space-y-6">
                        {newsList.map((news) => (
                            <NewsCard key={news.newsId} news={news} onRemove={handleRemoveArticle} />
                        ))}
                      </div>
                  ) : (
                      <div className="text-center text-gray-500 py-24 border-2 border-dashed rounded-xl bg-white">
                        <BookMarked className="mx-auto h-16 w-16 text-gray-400" />
                        <h3 className="mt-4 text-xl font-semibold text-gray-800">컬렉션이 비어있습니다.</h3>
                        <p className="mt-2 text-base text-gray-500">관심있는 뉴스를 추가하여 컬렉션을 채워보세요.</p>
                      </div>
                  )}
                </main>

                {pageInfo && pageInfo.totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                                aria-disabled={pageInfo.first}
                                className={pageInfo.first ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                          {[...Array(pageInfo.totalPages).keys()].map(pageNumber => (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); handlePageChange(pageNumber); }}
                                    isActive={currentPage === pageNumber}
                                >
                                  {pageNumber + 1}
                                </PaginationLink>
                              </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                                aria-disabled={pageInfo.last}
                                className={pageInfo.last ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                )}
              </>
          )}
        </div>
      </div>
  );
};

export default CollectionDetailPage;