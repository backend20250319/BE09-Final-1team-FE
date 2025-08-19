"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const API_BASE_URL = "/api/news/mypage";

const fetchScrapsAPI = async (token) => {
  if (!token) {
    console.log("토큰이 없어 스크랩 목록을 조회하지 않습니다.");
    return { content: [] };
  }

  const response = await fetch(`${API_BASE_URL}/scraps`, {
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

  const loadInitialScraps = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setScraps([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await fetchScrapsAPI(token);
      setScraps(data.content || data || []);
    } catch (error) {
      console.error(error);
      if (error.message !== "인증 에러") {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialScraps();
  }, [loadInitialScraps]);

  const addScrap = (news) => {
    if (!scraps.some((item) => item.newsId === news.newsId)) {
      setScraps((prevScraps) => [
        { ...news, scrapedAt: new Date().toISOString().slice(0, 10) },
        ...prevScraps,
      ]);
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
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setScraps(originalScraps);
    }
  };

  return (
      <ScrapContext.Provider value={{ scraps, addScrap, removeScrap, isLoading, refreshScraps: loadInitialScraps }}>
        {children}
      </ScrapContext.Provider>
  );
}

export function useScrap() {
  return useContext(ScrapContext);
}