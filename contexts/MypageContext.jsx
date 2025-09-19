"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { authenticatedFetch } from "@/lib/auth/auth";

const MypageContext = createContext();

export const useMypageContext = () => {
  const context = useContext(MypageContext);
  if (!context) {
    throw new Error("useMypageContext must be used within MypageProvider");
  }
  return context;
};

export const MypageProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [readArticleCount, setReadArticleCount] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        setIsLoadingHistory(true);
        setHistoryError(null);

        // Next.js API 라우트를 호출 (백엔드 직접 호출 대신)
        const historyUrl = `/api/users/mypage/history/index?page=0&size=10&sort=updatedAt,DESC`;
        const response = await authenticatedFetch(historyUrl);

        if (!response.ok) {
          throw new Error("읽기 기록 정보를 불러올 수 없습니다.");
        }

        const data = await response.json();

        if (data.success) {
          setHistory(data.data.content || []);
          setReadArticleCount(data.data.totalElements || 0);
        } else {
          throw new Error(
            data.message || "읽기 기록 정보를 불러오는데 실패했습니다."
          );
        }
      } catch (err) {
        console.error("Failed to fetch history data:", err);
        setHistoryError(err.message);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistoryData();
  }, []);

  const value = {
    history,
    readArticleCount,
    isLoadingHistory,
    historyError,
  };

  return (
    <MypageContext.Provider value={value}>{children}</MypageContext.Provider>
  );
};
