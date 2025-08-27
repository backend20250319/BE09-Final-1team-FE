"use client";

import { useState, useEffect } from "react";

export default function SubscriberCount({ darkTheme = false }) {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/subscriber-count", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          setCount(data.count);
        } else {
          console.warn("구독자 수 API 응답 오류:", res.status);
          setCount(15420); // 기본값 설정
        }
      } catch (error) {
        console.error("구독자 수 로딩 실패:", error);
        setCount(15420); // 기본값 설정
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
    
    // 60초마다 업데이트
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || count === null) {
    return <span className={`text-xs ${darkTheme ? 'text-gray-400' : 'text-gray-500'}`}>구독자 수 로딩 중...</span>;
  }

  return (
    <span className={`text-xs ${darkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
      {count.toLocaleString()}명이 구독중
    </span>
  );
} 