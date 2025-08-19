"use client";

import React, { useState } from 'react';
import { Bookmark, Bot, Share, Siren } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

import FontSizeButton from "./FontSizeButton";
import FontSizeSelector from "./FontSizeSelector";
import { useScrap } from "@/contexts/ScrapContext";

const NewsActions = ({ newsData, onSummaryOpen, onShareOpen, isFontSizeSelectorOpen, onFontSizeSelectorToggle, fontSize, onFontSizeChange }) => {
  const { addScrap } = useScrap();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState({ scrap: false, report: false });

  const handleAction = async (actionType) => {
    setIsLoading(prev => ({ ...prev, [actionType]: true }));

    const authToken = localStorage.getItem('accessToken');

    if (!authToken) {
      if (window.confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push("/auth");
      }
      setIsLoading(prev => ({ ...prev, [actionType]: false }));
      return;
    }

    try {
      const response = await fetch(`/api/news/${newsData.newsId}/${actionType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        if (actionType === 'scrap') {
          addScrap(newsData);
          toast.success("기사가 스크랩되었습니다.");
        } else if (actionType === 'report') {
          toast.success("기사가 정상적으로 신고되었습니다.");
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: "서버 응답을 파싱할 수 없습니다." }));

        if (response.status === 401) {
          toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
          router.push("/auth");
        } else if (response.status === 403) {
          toast.error("이 기사는 관리자에 의해 비공개 처리되었습니다.");
        } else {
          toast.error(errorData.message || "요청 처리 중 오류가 발생했습니다.");
        }
      }
    } catch (error) {
      console.error(`Error during ${actionType}:`, error);
      toast.error("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(prev => ({ ...prev, [actionType]: false }));
    }
  };

  return (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
              onClick={() => handleAction("scrap")}
              disabled={isLoading.scrap}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            <Bookmark size={18} />
            <span>{isLoading.scrap ? "처리중..." : "스크랩"}</span>
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
              onClick={() => handleAction("report")}
              disabled={isLoading.report}
              className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 disabled:opacity-50"
          >
            <Siren className="w-6 h-6 text-red-500" />
          </button>
        </div>
      </div>
  );
};

export default NewsActions;