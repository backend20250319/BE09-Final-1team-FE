"use client";

import React, { useState } from "react";
import { Bookmark, Bot, Share, Siren } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/lib/auth";

import FontSizeButton from "./FontSizeButton";
import FontSizeSelector from "./FontSizeSelector";
import { useScrap } from "@/contexts/ScrapContext";
import ReportModal from "./ReportModal";
import LoginConfirmModal from "./LoginConfirmModal";

const NewsActions = ({
  newsData,
  onSummaryOpen,
  onShareOpen,
  isFontSizeSelectorOpen,
  onFontSizeSelectorToggle,
  fontSize,
  onFontSizeChange,
}) => {
  const { addScrap } = useScrap();
  const router = useRouter();

  const [isScrapLoading, setIsScrapLoading] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleScrap = async () => {
    if (isScrapLoading) return;

    setIsScrapLoading(true);
    try {
      await addScrap(newsData);
    } catch (error) {
      // addScrap에서 인증 오류가 발생하면 로그인 모달을 표시
      if (error.message === "Authentication required") {
        setIsLoginModalOpen(true);
      }
    } finally {
      setIsScrapLoading(false);
    }
  };

  const handleReportClick = () => {
    // 신고 모달을 바로 열고, 모달 내부에서 인증 처리
    setIsReportModalOpen(true);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={handleScrap}
          disabled={isScrapLoading}
          className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
        >
          <Bookmark size={18} />
          <span>{"스크랩"}</span>
        </button>

        <button
          onClick={onSummaryOpen}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm font-semibold text-white"
          style={{
            background:
              "linear-gradient(135deg, rgba(102, 126, 234, 1) 0%, rgba(118, 75, 162, 1) 50%, rgba(245, 87, 108, 1) 100%)",
          }}
        >
          <Bot size={18} />
          <span>요약봇</span>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <FontSizeButton onClick={onFontSizeSelectorToggle} />
          {isFontSizeSelectorOpen && (
            <FontSizeSelector
              currentValue={fontSize}
              onSelect={onFontSizeChange}
              onClose={() => onFontSizeSelectorToggle(false)}
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

      {/* 신고 모달 렌더링 */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        newsId={newsData.newsId}
      />

      {/* 로그인 확인 모달 렌더링 */}
      <LoginConfirmModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

export default NewsActions;
