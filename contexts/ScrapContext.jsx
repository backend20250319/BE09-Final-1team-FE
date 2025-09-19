"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import { authenticatedFetch, isAuthenticated } from "@/lib/auth/auth";

const API_BASE_URL = "/api/users/mypage";

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

  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/scraps?${params.toString()}`
    );

    // authenticatedFetch에서 이미 401 에러를 처리하므로 여기서는 제거
    if (!response.ok) {
      // 응답 상태와 에러 메시지를 더 자세히 로깅
      console.error("스크랩 목록 API 에러:", {
        status: response.status,
        statusText: response.statusText,
        url: `${API_BASE_URL}/scraps?${params.toString()}`
      });
      
      // 응답 본문도 확인해보기
      try {
        const errorText = await response.text();
        console.error("스크랩 목록 API 에러 응답:", errorText);
      } catch (e) {
        console.error("에러 응답 읽기 실패:", e);
      }
      
      throw new Error(`스크랩 목록을 불러오는데 실패했습니다. (상태: ${response.status})`);
    }
    return response.json();
  } catch (error) {
    console.error("fetchScrapsAPI 에러:", error);
    throw error;
  }
};

const addScrapAPI = async (newsId) => {
  const response = await authenticatedFetch(`/api/users/news/${newsId}/scrap`, {
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
    // 로그인하지 않은 사용자는 스크랩 API를 호출하지 않음
    if (!isAuthenticated()) {
      console.log("로그인하지 않은 사용자 - 스크랩 목록 로딩 건너뜀");
      setScraps([]);
      setTotalScraps(0);
      setTotalPages(0);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log("스크랩 목록 로딩 시작:", { category, page, query });
      const data = await fetchScrapsAPI(category, page, query);
      console.log("스크랩 목록 로딩 성공:", data);
      
      const content = data.content || [];
      // 데이터 중복 제거 로직 추가
      const uniqueScraps = Array.from(
        new Map(content.map((item) => [item.newsId, item])).values()
      );
      setScraps(uniqueScraps);
      setTotalPages(data.totalPages || 0);
      setTotalScraps(data.totalElements || 0);
    } catch (err) {
      console.error("loadScraps 에러:", err);
      
      if (err.message.includes("세션이 만료")) {
        // 세션 만료 에러인 경우 빈 데이터로 설정
        console.log("세션 만료로 인한 스크랩 목록 초기화");
        setScraps([]);
        setTotalScraps(0);
        setError(null); // 세션 만료는 에러로 표시하지 않음
      } else if (err.message.includes("상태: 404")) {
        // 404 에러는 스크랩이 없다는 의미일 수 있음
        console.log("스크랩 목록이 비어있음 (404)");
        setScraps([]);
        setTotalScraps(0);
        setError(null);
      } else if (err.message.includes("상태: 500")) {
        // 서버 에러 - C002 에러 코드 처리
        setError("백엔드 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        setScraps([]);
        setTotalScraps(0);
      } else if (err.message.includes("ECONNREFUSED") || err.message.includes("ENOTFOUND")) {
        // 백엔드 서버 연결 실패
        setError("백엔드 서버에 연결할 수 없습니다. 서버 상태를 확인해주세요.");
        setScraps([]);
        setTotalScraps(0);
      } else {
        // 기타 에러
        setError(err.message || "스크랩 목록을 불러오는데 실패했습니다.");
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
      if (!isAuthenticated()) {
        toast.error("로그인이 필요합니다.");
        return;
      }
      
      try {
        await addScrapAPI(news.newsId);
        toast.success("스크랩에 추가되었습니다.");
        loadScraps(selectedCategory, currentPage, searchQuery);
      } catch (error) {
        if (error.message.includes("이미 스크랩된")) {
          toast.error("이미 스크랩된 기사입니다.");
        } else if (error.message.includes("세션이 만료")) {
          toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
        } else {
          toast.error(error.message || "스크랩 추가 중 오류가 발생했습니다.");
        }
      }
    },
    [selectedCategory, currentPage, searchQuery, loadScraps]
  );

  const removeScrap = async (newsId) => {
    if (!isAuthenticated()) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    
    try {
      await removeScrapAPI(newsId);
      toast.success("스크랩이 삭제되었습니다.");
      loadScraps(selectedCategory, currentPage, searchQuery);
    } catch (err) {
      if (err.message.includes("세션이 만료")) {
        toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
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
