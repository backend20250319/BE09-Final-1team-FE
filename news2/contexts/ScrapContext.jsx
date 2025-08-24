"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const API_BASE_URL = "/api/news/mypage";

const fetchScrapsAPI = async (token, category, page = 0) => {
  if (!token) {
    console.log("토큰이 없어 스크랩 목록을 조회하지 않습니다.");
    return { content: [], totalPages: 0 };
  }

  const categoryQuery = (category && category !== '전체') ? `&category=${encodeURIComponent(category)}` : '';

  const response = await fetch(`${API_BASE_URL}/scraps?page=${page}&size=10${categoryQuery}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (response.status === 401) {
    toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
    throw new Error("인증 에러");
  }

  if (!response.ok) {
    throw new Error("스크랩 목록을 불러오는데 실패했습니다.");
  }
  return response.json();
};

const removeScrapAPI = async (newsId, token) => {
  const response = await fetch(`${API_BASE_URL}/scraps/${newsId}`, {
    method: "DELETE",
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("스크랩 삭제에 실패했습니다.");
  }
  return true;
};

const ScrapContext = createContext();

export function ScrapProvider({ children }) {
  const [scraps, setScraps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadScraps = useCallback(async (category, page) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setScraps([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchScrapsAPI(token, category, page);
      setScraps(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setScraps([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScraps(selectedCategory, currentPage);
  }, [selectedCategory, currentPage, loadScraps]);

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(0);
  };

  const addScrap = (news) => {
    if (selectedCategory === '전체' || selectedCategory === news.categoryName) {
      if (!scraps.some((item) => item.newsId === news.newsId)) {
        setScraps((prevScraps) => [
          { ...news, scrapedAt: new Date().toISOString().slice(0, 10) },
          ...prevScraps,
        ]);
      }
    }
  };

  const removeScrap = async (newsId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const originalScraps = [...scraps];
    setScraps((prevScraps) => prevScraps.filter((item) => item.newsId !== newsId));

    try {
      await removeScrapAPI(newsId, token);
      toast.success("스크랩이 삭제되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      setScraps(originalScraps);
    }
  };

  const value = {
    scraps,
    isLoading,
    error,
    selectedCategory,
    handleCategoryChange,
    addScrap,
    removeScrap,
    currentPage,
    totalPages,
    setCurrentPage,
  };

  return (
      <ScrapContext.Provider value={value}>
        {children}
      </ScrapContext.Provider>
  );
}

export function useScrap() {
  return useContext(ScrapContext);
}