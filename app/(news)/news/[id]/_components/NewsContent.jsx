// 뉴스 본문, 이미지, 관련 키워드를 표시하는 컴포넌트
"use client";

import React from 'react';

const NewsContent = ({ newsData, fontSize }) => {
  return (
    <>
      {newsData.imageUrl && (
        <div className="my-6">
          <img
            src={newsData.imageUrl}
            alt={newsData.title}
            className="w-full max-h-full object-cover rounded-xl mx-auto"
          />
        </div>
      )}
      <article
        className="prose prose-lg max-w-none text-lg leading-relaxed text-gray-800"
        style={{ fontSize: `${fontSize}px` }}
      >
        <div dangerouslySetInnerHTML={{ __html: newsData.content }} />
      </article>
      {newsData.tags && newsData.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">관련 키워드</h3>
          <div className="flex flex-wrap gap-2">
            {newsData.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default NewsContent;