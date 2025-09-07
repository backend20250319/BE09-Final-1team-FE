// 뉴스 상세 페이지의 헤더 (제목, 기자, 날짜 등) 컴포넌트
'use client';

import React from 'react';
import { User, Clock } from 'lucide-react';

const NewsHeader = ({ newsData }) => {
  return (
    <header className="pb-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-lg font-bold text-gray-700">
          {newsData.source}
        </span>
        <span className="text-gray-400">•</span>
        <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-2 py-0.5 rounded-full">
          {newsData.category}
        </span>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 line-clamp-2">
        {newsData.title}
      </h1>
      <div className="flex justify-between items-center text-gray-600 text-sm">
        <p className="flex items-center">
          <User className="w-4 h-4 mr-1.5" />
          {newsData.reporter.name} 기자
        </p>
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-sm mr-2 text-black">
            <Clock className="h-4 w-4 mr-1" />
            {newsData.date}
          </span>
        </div>
      </div>
    </header>
  );
};

export default NewsHeader;
