"use client";

import { useState, useEffect } from "react";
import { authenticatedFetch } from '@/lib/auth/auth';

export default function SubscriberCount({ 
  darkTheme = false, 
  category = null, 
  showCategoryStats = false 
}) {
  const [count, setCount] = useState(null);
  const [categoryStats, setCategoryStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = "/api/newsletter/stats/subscribers";
        
        if (category) {
          // 특정 카테고리 구독자 수 조회
          url = `/api/newsletter/stats/subscribers?category=${encodeURIComponent(category)}`;
        } else if (showCategoryStats) {
          // 전체 카테고리 통계 조회
          url = "/api/newsletter/stats/subscribers";
        }

        // authenticatedFetch를 사용하여 쿠키 인증 자동 처리
        const res = await authenticatedFetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          
          if (category) {
            // 특정 카테고리 데이터
            const categoryData = data.data?.[category];
            setCount(categoryData || data.data?.subscriberCount || data.data?.activeSubscribers || 0);
          } else if (showCategoryStats) {
            // 전체 카테고리 통계 데이터
            setCategoryStats(data.data);
            setCount(data.data?.totalSubscribers || 0);
          } else {
            // 기존 전체 구독자 수
            setCount(data.count || 0);
          }
        } else {
          console.warn("구독자 수 API 응답 오류:", res.status);
          setCount(0); // 기본값을 0으로 설정
        }
      } catch (error) {
        console.error("구독자 수 로딩 실패:", error);
        setCount(0); // 기본값을 0으로 설정
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // 60초마다 업데이트
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [category, showCategoryStats]);

  if (loading || count === null) {
    return (
      <span className={`text-xs ${darkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
        구독자 수 로딩 중...
      </span>
    );
  }

  // 카테고리별 통계 표시
  if (showCategoryStats && categoryStats) {
    return (
      <div className={`text-xs ${darkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
        <div>전체 {count.toLocaleString()}명 구독중</div>
        {categoryStats.categoryBreakdown && (
          <div className="mt-2 space-y-1">
            {Object.entries(categoryStats.categoryBreakdown)
              .sort(([,a], [,b]) => b.subscriberCount - a.subscriberCount)
              .slice(0, 5)
              .map(([cat, stats]) => (
                <div key={cat} className="flex justify-between">
                  <span>{cat}:</span>
                  <span>{stats.subscriberCount.toLocaleString()}명</span>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  }

  // 특정 카테고리 구독자 수 표시
  if (category) {
    return (
      <span className={`text-xs ${darkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
        {count.toLocaleString()}명이 {category} 구독중
      </span>
    );
  }

  // 기본 전체 구독자 수 표시
  return (
    <span className={`text-xs ${darkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
      {count.toLocaleString()}명이 구독중
    </span>
  );
}