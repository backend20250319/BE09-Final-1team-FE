// 뉴스 카드 로딩 시 표시될 스켈레톤 UI
import React from 'react';

const NewsCardSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="border rounded-lg overflow-hidden bg-white animate-pulse"
      >
        <div className="w-full h-40 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-5 bg-gray-200 rounded w-full mb-3"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

export default NewsCardSkeleton;
