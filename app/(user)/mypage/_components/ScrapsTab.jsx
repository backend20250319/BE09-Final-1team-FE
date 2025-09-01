'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Share2, Calendar, FolderPlus } from "lucide-react";
import { useScrap } from "@/contexts/ScrapContext";
import Link from "next/link";
import AddToCollectionModal from "./AddToCollectionModal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ScrapSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
            <div className="flex items-center justify-end">
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
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
    setCurrentPage
  } = useScrap();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  const handleOpenModal = (news) => {
    setSelectedNews(news);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedNews(null);
    setIsModalOpen(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return <ScrapSkeleton />;
    }

    if (error) {
      return (
          <div className="text-center py-12 text-red-500">
            <h3 className="text-lg font-semibold">데이터를 불러오는데 실패했습니다.</h3>
            <p className="text-sm">{error}</p>
          </div>
      );
    }

    if (scraps.length === 0) {
      return (
          <div className="text-gray-500 text-center py-12">
            <Bookmark className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold">
              {selectedCategory === "전체"
                  ? "스크랩한 뉴스가 없습니다."
                  : `'${selectedCategory}' 카테고리의 스크랩이 없습니다.`
              }
            </h3>
            <p className="text-sm text-gray-600 mt-1">관심 있는 기사를 스크랩하여 나중에 다시 읽어보세요.</p>
          </div>
      );
    }

    const uniqueScraps = scraps.filter((news, index, self) =>
        index === self.findIndex((n) => n.newsId === news.newsId)
    );

    return (
        <div className="space-y-4">
          {uniqueScraps.map((news) => (
              <div
                  key={news.newsId}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <Link
                      href={`/news/${news.newsId}`}
                      className="font-semibold text-lg hover:text-indigo-600 transition-colors cursor-pointer pr-4"
                  >
                    {news.title}
                  </Link>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
                  <Badge variant="secondary">{news.categoryName}</Badge>
                  <span>{news.press}</span>
                  {news.scrapedAt && (
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
                        {new Date(news.scrapedAt).toLocaleDateString()}
                      </span>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-2">
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(news)}
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    컬렉션에 추가
                  </Button>
                  <Link href={`/news/${news.newsId}`} passHref legacyBehavior>
                    <Button variant="outline" size="sm" as="a">
                      기사 읽기
                    </Button>
                  </Link>
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeScrap(news.newsId)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </Button>
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
            <CardTitle className="flex items-center">
              <Bookmark className="h-5 w-5 mr-2" />
              스크랩한 뉴스
            </CardTitle>
            <CardDescription>
              관심 있는 뉴스를 저장하고 나중에 다시 읽어보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="lg:w-full overflow-x-auto flex-wrap flex items-center justify-between space-x-1 pb-4">
              {categories.map((category) => (
                  <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="default"
                      onClick={() => handleCategoryChange(category)}
                      className="whitespace-nowrap hover-lift text-base px-4 py-2"
                  >
                    {category}
                  </Button>
              ))}
            </div>
            {renderContent()}
          </CardContent>
        </Card>

        {selectedNews && (
            <AddToCollectionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                newsId={selectedNews.newsId}
                newsTitle={selectedNews.title}
            />
        )}
      </>
  );
}