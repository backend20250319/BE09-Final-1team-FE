"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const API_BASE_URL = "/api/news/mypage";

const fetchScrapsAPI = async (token, category, page = 0, searchQuery = "") => {
  if (!token) {
    console.log("토큰이 없어 스크랩 목록을 조회하지 않습니다.");
    return { content: [], totalPages: 0, totalElements: 0 };
  }
  const params = new URLSearchParams({
    page: page.toString(),
    size: '10',
  });
  if (category && category !== '전체') {
    params.append('category', category);
  }
  if (searchQuery) {
    params.append('q', searchQuery); // 'query' -> 'q' 로 변경
  }

  const response = await fetch(`${API_BASE_URL}/scraps?${params.toString()}`, {
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

const addScrapAPI = async (newsId, token) => {
  const response = await fetch(`/api/news/${newsId}/scrap`, {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) return true;
  if (response.status === 409) throw new Error("이미 스크랩된 기사입니다.");
  const responseText = await response.text();
  if (responseText.includes("이미 스크랩된")) throw new Error("이미 스크랩된 기사입니다.");
  throw new Error(responseText || "스크랩 추가에 실패했습니다.");
};

const removeScrapAPI = async (newsId, token) => {
  const response = await fetch(`${API_BASE_URL}/scraps/${newsId}`, {
    method: "DELETE",
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("스크랩 삭제에 실패했습니다.");
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
  const [totalScraps, setTotalScraps] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const loadScraps = useCallback(async (category, page, query) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setScraps([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchScrapsAPI(token, category, page, query);
      const content = data.content || [];
      // 데이터 중복 제거 로직 추가
      const uniqueScraps = Array.from(new Map(content.map(item => [item.newsId, item])).values());
      setScraps(uniqueScraps);
      setTotalPages(data.totalPages || 0);
      setTotalScraps(data.totalElements || 0);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setScraps([]);
      setTotalScraps(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScraps(selectedCategory, currentPage, searchQuery);
  }, [selectedCategory, currentPage, searchQuery, loadScraps]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(0);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(0);
  }

  const addScrap = useCallback(async (news) => {
    const token = localStorage.getItem("accessToken");
    if (!token) { toast.error("로그인이 필요합니다."); return; }
    
    try {
      await addScrapAPI(news.newsId, token);
      toast.success("스크랩에 추가되었습니다.");
      loadScraps(selectedCategory, currentPage, searchQuery);
    } catch (error) {
      if (error.message.includes("이미 스크랩된")) {
        toast.error("이미 스크랩된 기사입니다.");
      } else {
        toast.error(error.message || "스크랩 추가 중 오류가 발생했습니다.");
      }
    }
  }, [selectedCategory, currentPage, searchQuery, loadScraps]);

  const removeScrap = async (newsId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) { toast.error("로그인이 필요합니다."); return; }
    
    try {
      await removeScrapAPI(newsId, token);
      toast.success("스크랩이 삭제되었습니다.");
      loadScraps(selectedCategory, currentPage, searchQuery);
    } catch (err) {
      toast.error("스크랩 삭제에 실패했습니다.");
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
    totalScraps,
    searchQuery,
    handleSearch,
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
