// 스크랩, 요약, 공유 등 뉴스 관련 액션 버튼 그룹 컴포넌트
'use client';

import React, { useState } from 'react';
import { useScrap } from '@/contexts/ScrapContext';
import { isAuthenticated } from '@/lib/auth/auth';
import { Bookmark, Bot, Share, Siren } from 'lucide-react';
import FontSizeButton from './FontSizeButton';
import FontSizeSelector from './FontSizeSelector';
import ReportModal from './ReportModal';
import LoginConfirmModal from './LoginConfirmModal';

const NewsActions = ({ newsData, onSummaryOpen, onShareOpen, fontSize, onFontSizeChange }) => {
  const { addScrap } = useScrap();
  const [isScrapLoading, setIsScrapLoading] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFontSizeOpen, setFontSizeOpen] = useState(false);

  const handleScrap = async () => {
    if (!isAuthenticated()) {
      setIsLoginModalOpen(true);
      return;
    }
    if (isScrapLoading) return;

    setIsScrapLoading(true);
    try {
      await addScrap(newsData);
    } finally {
      setIsScrapLoading(false);
    }
  };

  const handleReportClick = () => {
    if (!isAuthenticated()) {
      setIsLoginModalOpen(true);
    } else {
      setIsReportModalOpen(true);
    }
  };

  const handleFontSizeToggle = () => {
    setFontSizeOpen((prev) => !prev);
  };

  return (
    <div className="flex mb-7 flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={handleScrap}
          disabled={isScrapLoading}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 ${
            isAuthenticated() 
              ? "bg-gray-100 hover:bg-gray-200 text-gray-700" 
              : "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
          }`}
          title={!isAuthenticated() ? "로그인 후 스크랩 가능" : "스크랩"}
        >
          <Bookmark size={18} />
          <span>{isAuthenticated() ? "스크랩" : "로그인 후 스크랩"}</span>
        </button>
        <button
          onClick={onSummaryOpen}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm font-semibold text-white"
          style={{
            background:
              'linear-gradient(135deg, rgba(102, 126, 234, 1) 0%, rgba(118, 75, 162, 1) 50%, rgba(245, 87, 108, 1) 100%)',
          }}
        >
          <Bot size={18} />
          <span>요약봇</span>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <FontSizeButton onClick={handleFontSizeToggle} />
          {isFontSizeOpen && (
            <FontSizeSelector
              currentValue={fontSize}
              onSelect={onFontSizeChange}
              onClose={() => setFontSizeOpen(false)}
            />
          )}
        </div>
        <button
          onClick={onShareOpen}
          className="p-2 hover:bg-gray-100 rounded-full hover:shadow-md transition-all duration-200"
        >
          <Share className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={handleReportClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          <Siren className="w-6 h-6 text-red-500" />
        </button>
      </div>
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        newsId={newsData.newsId}
      />
      <LoginConfirmModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

export default NewsActions;
