// 파일 경로: app/mypage/collections/[collectionId]/page.jsx

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from "sonner";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// 뉴스 아이템을 표시하는 간단한 컴포넌트
const NewsCard = ({ news }) => (
  <div className="border rounded-lg p-4 flex gap-4 hover:bg-gray-50 transition-colors">
    {news.imageUrl && (
      <img src={news.imageUrl} alt={news.title} className="w-24 h-24 object-cover rounded-md" />
    )}
    <div className="flex-1">
      <p className="text-sm text-gray-500">{news.press}</p>
      <h3 className="font-semibold text-lg leading-snug mt-1">{news.title}</h3>
      <p className="text-xs text-gray-400 mt-2">스크랩 일시: {new Date(news.scrappedAt).toLocaleString()}</p>
    </div>
  </div>
);

const CollectionDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.collectionId;

  const [newsList, setNewsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // TODO: 컬렉션 이름도 표시하면 좋지만, 현재 API에서는 뉴스 목록만 가져오므로 일단 생략합니다.

  const fetchNewsInCollection = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
      setIsLoading(false);
      setTimeout(() => router.push('/auth'), 2000);
      return;
    }

    setIsLoading(true);
    try {
      // 프론트엔드 API 라우트를 호출합니다.
      const response = await fetch(`/api/collections/${collectionId}/news`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '컬렉션의 뉴스 목록을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setNewsList(data.content || []); // 페이징된 결과의 content를 사용합니다.
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [collectionId, router]);

  useEffect(() => {
    if (collectionId) {
      fetchNewsInCollection();
    }
  }, [collectionId, fetchNewsInCollection]);

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/mypage?tab=collections" className="flex items-center text-sm text-gray-600 hover:text-black">
            <ArrowLeft className="w-4 h-4 mr-2" />
            나의 컬렉션으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold mt-2">컬렉션 #{collectionId}</h1>
          <p className="text-gray-500 mt-1">이 컬렉션에 담긴 뉴스 목록입니다.</p>
        </div>

        {isLoading && <p className="text-center">뉴스 목록을 불러오는 중...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!isLoading && !error && (
          <div className="space-y-4">
            {newsList.length > 0 ? (
              newsList.map((news) => (
                <NewsCard key={news.newsId} news={news} />
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">이 컬렉션에 담긴 뉴스가 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionDetailPage;