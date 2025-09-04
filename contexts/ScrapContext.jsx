"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/auth";

const API_BASE_URL = "/api/news/mypage";

const fetchScrapsAPI = async (category, page = 0, searchQuery = "") => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: "10",
  });
  if (category && category !== "전체") {
    params.append("category", category);
  }
  if (searchQuery) {
    params.append("q", searchQuery); // 'query' -> 'q' 로 변경
  }

  const response = await authenticatedFetch(
    `${API_BASE_URL}/scraps?${params.toString()}`
  );

  if (response.status === 401) {
    toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
    throw new Error("인증 에러");
  }
  if (!response.ok) {
    throw new Error("스크랩 목록을 불러오는데 실패했습니다.");
  }
  return response.json();
};

const addScrapAPI = async (newsId) => {
  const response = await authenticatedFetch(`/api/news/${newsId}/scrap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) return true;
  if (response.status === 409) throw new Error("이미 스크랩된 기사입니다.");
  const responseText = await response.text();
  if (responseText.includes("이미 스크랩된"))
    throw new Error("이미 스크랩된 기사입니다.");
  throw new Error(responseText || "스크랩 추가에 실패했습니다.");
};

const removeScrapAPI = async (newsId) => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/scraps/${newsId}`,
    {
      method: "DELETE",
    }
  );
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
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchScrapsAPI(category, page, query);
      const content = data.content || [];
      // 데이터 중복 제거 로직 추가
      const uniqueScraps = Array.from(
        new Map(content.map((item) => [item.newsId, item])).values()
      );
      setScraps(uniqueScraps);
      setTotalPages(data.totalPages || 0);
      setTotalScraps(data.totalElements || 0);
    } catch (err) {
      console.error(err);
      if (err.message.includes("인증")) {
        // 인증 에러인 경우 빈 데이터로 설정
        setScraps([]);
        setTotalScraps(0);
      } else {
        setError(err.message);
        setScraps([]);
        setTotalScraps(0);
      }
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
  };

  const addScrap = useCallback(
    async (news) => {
      try {
        await addScrapAPI(news.newsId);
        toast.success("스크랩에 추가되었습니다.");
        loadScraps(selectedCategory, currentPage, searchQuery);
      } catch (error) {
        if (error.message.includes("이미 스크랩된")) {
          toast.error("이미 스크랩된 기사입니다.");
        } else if (error.message.includes("인증")) {
          toast.error("로그인이 필요합니다.");
        } else {
          toast.error(error.message || "스크랩 추가 중 오류가 발생했습니다.");
        }
      }
    },
    [selectedCategory, currentPage, searchQuery, loadScraps]
  );

  const removeScrap = async (newsId) => {
    try {
      await removeScrapAPI(newsId);
      toast.success("스크랩이 삭제되었습니다.");
      loadScraps(selectedCategory, currentPage, searchQuery);
    } catch (err) {
      if (err.message.includes("인증")) {
        toast.error("로그인이 필요합니다.");
      } else {
        toast.error("스크랩 삭제에 실패했습니다.");
      }
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
    <ScrapContext.Provider value={value}>{children}</ScrapContext.Provider>
  );
}

export function useScrap() {
  return useContext(ScrapContext);
}
