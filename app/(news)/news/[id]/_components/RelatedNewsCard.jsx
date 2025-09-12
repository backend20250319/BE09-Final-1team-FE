// 함께 보면 좋은 뉴스 컴포넌트
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const backendToFrontendCategory = {
  POLITICS: "정치",
  ECONOMY: "경제",
  SOCIETY: "사회",
  LIFE: "생활",
  INTERNATIONAL: "세계",
  IT_SCIENCE: "IT/과학",
  VEHICLE: '자동차/교통',
  TRAVEL_FOOD: '여행/음식',
  ART: '예술'
};

const RelatedNewsCard = ({ news }) => {
  if (!news || !news.newsId) {
    return null;
  }

  const publishedDate = news.publishedAt || news.date;
  const formattedDate = publishedDate
      ? new Date(publishedDate).toLocaleDateString('ko-KR')
      : '날짜 없음';

  const rawCategory = news.categoryName || news.category || '기타';
  const convertedCategory = backendToFrontendCategory[rawCategory] || rawCategory;

  return (
      <Link href={`/news/${news.newsId}`} className="block h-full transition-all duration-200 hover:shadow-lg rounded-xl overflow-hidden">
        <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl">
          <div className="relative w-full h-60 flex-shrink-0">
            <Image
                src={news.imageUrl || '/placeholder.svg'}
                alt={news.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <h4 className="font-semibold text-base line-clamp-2 mb-2">
              {news.title}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-auto">
              <span className="text-sm text-gray-500">{news.press || news.source}</span>
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                              {convertedCategory}
                          </span>
            </div>
          </div>
        </div>
      </Link>
  );
};

export default RelatedNewsCard;