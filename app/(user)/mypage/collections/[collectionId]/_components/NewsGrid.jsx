// 뉴스 기사 목록을 그리드 형태로 표시하는 컴포넌트
import React from 'react';
import NewsCard from './NewsCard';
import NewsCardSkeleton from './NewsCardSkeleton';
import { BookMarked } from 'lucide-react';

const NewsGrid = ({
  isNewsLoading,
  newsList,
  searchQuery,
  selectedCategory,
  onRemove,
  onShare,
  onAddToCollection,
}) => {
  if (isNewsLoading) {
    return <NewsCardSkeleton />;
  }

  if (newsList.length === 0) {
    return (
      <div className="text-center text-gray-500 py-24 border-2 border-dashed rounded-xl bg-white">
        <BookMarked className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-xl font-semibold text-gray-800">
          표시할 기사가 없습니다.
        </h3>
        <p className="mt-2 text-base text-gray-500">
          {searchQuery || selectedCategory !== "전체"
            ? "검색 조건에 맞는 기사가 없습니다."
            : "이 컬렉션에 추가된 기사가 없습니다."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {newsList.map((news) => (
        <NewsCard
          key={news.newsId}
          news={news}
          onRemove={onRemove}
          onShare={onShare}
          onAddToCollection={onAddToCollection}
        />
      ))}
    </div>
  );
};

export default NewsGrid;
