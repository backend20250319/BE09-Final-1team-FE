'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const categories = ["전체", "정치", "경제", "사회", "생활", "세계", "IT/과학", "자동차/교통", "여행/음식", "예술"];

// 스크랩 목록을 불러오는 API 함수 (uncollectedOnly 파라미터 추가)
const fetchScrapsAPI = async (token, page = 0, size = 10, category = '전체', query = '', uncollectedOnly = false) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (category && category !== '전체') params.append('category', category);
  if (query) params.append('q', query);
  if (uncollectedOnly) params.append('uncollectedOnly', 'true');

  const response = await fetch(`/api/news/mypage/scraps?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("스크랩 목록을 불러오는데 실패했습니다.");
  }
  return response.json();
};

const AddScrapsToCollectionModal = ({ isOpen, onClose, collectionId, onSuccess }) => {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputQuery);
      setCurrentPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputQuery]);

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          toast.error("로그인이 필요합니다.");
          return;
        }
        setIsLoading(true);
        try {
          // uncollectedOnly=true 파라미터를 사용하여 아직 컬렉션에 추가되지 않은 스크랩만 조회
          const scrapsData = await fetchScrapsAPI(token, currentPage, 10, selectedCategory, searchQuery, true);

          setScraps(scrapsData.content || []);
          setTotalPages(scrapsData.totalPages || 0);

        } catch (error) {
          toast.error(error.message);
          setScraps([]);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    } else {
      // 모달이 닫힐 때 상태 초기화
      setScraps([]);
      setSelectedScraps(new Set());
      setInputQuery("");
      setSearchQuery("");
      setSelectedCategory("전체");
      setCurrentPage(0);
      setTotalPages(0);
      setIsLoading(true);
    }
  }, [isOpen, collectionId, selectedCategory, searchQuery, currentPage]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setInputQuery("");
    setSearchQuery("");
    setCurrentPage(0);
  };

  const handleSelectionChange = (scrapId) => {
    setSelectedScraps(prev => {
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
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    setIsAdding(true);
    try {
      await Promise.all(
          Array.from(selectedScraps).map(newsId =>
              fetch(`/api/news/collections/${collectionId}/news`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ newsId }),
              })
          )
      );
      toast.success(`${selectedScraps.size}개의 기사를 컬렉션에 추가했습니다.`);
      onSuccess();
      onClose();
    } catch (err) {
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
                  <Input placeholder="스크랩 기사 검색" className="pl-10" value={inputQuery} onChange={(e) => setInputQuery(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto">
                {categories.map(cat => (
                    <Button key={cat} variant={selectedCategory === cat ? 'default' : 'outline'} onClick={() => handleCategoryChange(cat)} className="whitespace-nowrap">{cat}</Button>
                ))}
              </div>
            </div>

            <div className="flex-grow overflow-y-auto px-4 pb-4">
              {isLoading ? <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin"/></div> : (
                  <div className="grid grid-cols-2 gap-4">
                    {scraps.length > 0 ? (
                        scraps.map(scrap => (
                            <div key={scrap.newsId} className={`border rounded-lg p-4 cursor-pointer flex items-start gap-4 ${selectedScraps.has(scrap.newsId) ? 'bg-indigo-50 shadow-md' : 'hover:shadow-md'}`} onClick={() => handleSelectionChange(scrap.newsId)}>
                              <Checkbox checked={selectedScraps.has(scrap.newsId)} className="mt-1 flex-shrink-0" />
                              <div className="relative w-24 h-20 flex-shrink-0">
                                <Image
                                  src={scrap.imageUrl || '/placeholder.svg'}
                                  alt={scrap.title}
                                  fill
                                  className="object-cover rounded-md"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold line-clamp-2">{scrap.title}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                  <span>{scrap.press}</span>
                                  <Badge variant="secondary">{scrap.categoryName}</Badge>
                                </div>
                              </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center text-gray-500 py-12">
                          <p className="text-lg font-semibold">컬렉션에 추가할 수 있는 스크랩 기사가 없습니다.</p>
                          <p className="text-sm text-gray-600 mt-1">검색 결과가 없거나, 모든 스크랩 기사가 이미 컬렉션에 포함되어 있습니다.</p>
                        </div>
                    )}
                  </div>
              )}
            </div>

            <DialogFooter className="p-4 border-t flex justify-between items-center">
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>{totalPages > 0 ? `${currentPage + 1} / ${totalPages}` : '-'}</span>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 flex justify-end items-center gap-2">
                <DialogClose asChild><Button variant="outline">취소</Button></DialogClose>
                <Button onClick={handleAddSelectedScraps} disabled={selectedScraps.size === 0 || isAdding}>
                  {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
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
