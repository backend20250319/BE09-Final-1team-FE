"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { authenticatedFetch } from "@/lib/auth/auth";

const categories = [
  "전체",
  "정치",
  "경제",
  "사회",
  "생활",
  "세계",
  "IT/과학",
  "자동차/교통",
  "여행/음식",
  "예술",
];

// 스크랩 목록을 불러오는 API 함수
const fetchScrapsAPI = async (
  page = 0,
  size = 10,
  category = "전체",
  query = "",
  uncollectedOnly = false
) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (category && category !== "전체") params.append("category", category);
  if (query) params.append("q", query);
  if (uncollectedOnly) params.append("uncollectedOnly", "true");

  const response = await authenticatedFetch(
    `/api/news/mypage/scraps?${params.toString()}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "스크랩 목록을 불러오는데 실패했습니다.");
  }
  return response.json();
};

const AddScrapsToCollectionModal = ({
  isOpen,
  onClose,
  collectionId,
  onSuccess,
}) => {
  const [scraps, setScraps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedScraps, setSelectedScraps] = useState(new Set());

  // 필터링 및 검색 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [inputQuery, setInputQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchScrapsAPI(
        currentPage,
        10,
        selectedCategory,
        searchQuery,
        true
      );
      setScraps(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (error) {
      console.error("Error loading scraps:", error);
      toast.error(error.message || "스크랩 목록을 불러오는데 실패했습니다.");
      setScraps([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputQuery);
      setCurrentPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputQuery]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      setScraps([]);
      setSelectedScraps(new Set());
      setInputQuery("");
      setSearchQuery("");
      setSelectedCategory("전체");
      setCurrentPage(0);
      setTotalPages(0);
      setIsLoading(true);
    }
  }, [isOpen, collectionId, loadData]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setInputQuery("");
    setSearchQuery("");
    setCurrentPage(0);
  };

  const handleSelectionChange = (scrapId) => {
    setSelectedScraps((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(scrapId)) {
        newSelection.delete(scrapId);
      } else {
        newSelection.add(scrapId);
      }
      return newSelection;
    });
  };

  const handleAddSelectedScraps = async () => {
    setIsAdding(true);
    try {
      const responses = await Promise.all(
        Array.from(selectedScraps).map((newsId) =>
          authenticatedFetch(`/api/news/collections/${collectionId}/news`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newsId }),
          })
        )
      );

      const successfulCount = responses.filter((res) => res.ok).length;
      const failedCount = responses.length - successfulCount;

      if (failedCount > 0) {
        toast.error(`${failedCount}개 기사 추가에 실패했습니다.`);
      }
      if (successfulCount > 0) {
        toast.success(
          `${successfulCount}개의 기사를 컬렉션에 추가했습니다.`
        );
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Error adding scraps to collection:", err);
      toast.error("기사 추가 중 오류가 발생했습니다.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>스크랩 기사 추가하기</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-shrink-0 p-4">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="스크랩 기사 검색"
                  className="pl-10"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => handleCategoryChange(cat)}
                  className="whitespace-nowrap"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex-grow overflow-y-auto px-4 pb-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {scraps.length > 0 ? (
                  scraps.map((scrap) => (
                    <div
                      key={scrap.newsId}
                      className={`border rounded-lg p-4 cursor-pointer flex items-start gap-4 ${
                        selectedScraps.has(scrap.newsId)
                          ? "bg-indigo-50 shadow-md"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => handleSelectionChange(scrap.newsId)}
                    >
                      <Checkbox
                        checked={selectedScraps.has(scrap.newsId)}
                        className="mt-1 flex-shrink-0"
                      />
                      <div className="relative w-24 h-20 flex-shrink-0">
                        <Image
                          src={scrap.imageUrl || "/placeholder.svg"}
                          alt={scrap.title}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold line-clamp-2">
                          {scrap.title}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <span>{scrap.press}</span>
                          <Badge variant="secondary">
                            {scrap.categoryName}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center text-gray-500 py-12">
                    <p className="text-lg font-semibold">
                      컬렉션에 추가할 수 있는 스크랩 기사가 없습니다.
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      검색 결과가 없거나, 모든 스크랩 기사가 이미 컬렉션에
                      포함되어 있습니다.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t flex justify-between items-center">
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>
                {totalPages > 0 ? `${currentPage + 1} / ${totalPages}` : "-"}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 flex justify-end items-center gap-2">
              <DialogClose asChild>
                <Button variant="outline">취소</Button>
              </DialogClose>
              <Button
                onClick={handleAddSelectedScraps}
                disabled={selectedScraps.size === 0 || isAdding}
              >
                {isAdding ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                선택한 {selectedScraps.size}개 기사 추가
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddScrapsToCollectionModal;
