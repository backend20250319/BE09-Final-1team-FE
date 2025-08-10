"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Mail, Gift } from "lucide-react";

export default function CampaignBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // 캠페인 활성화 여부 (실제로는 API에서 가져올 수 있음)
    const campaignActive = true; // 임시로 true로 설정
    
    if (!campaignActive) return;

    // localStorage에서 닫기 상태 확인
    const closedUntil = localStorage.getItem("nn_banner_until");
    const now = Date.now();
    
    // 닫기 기간이 지났거나 닫기 기록이 없으면 표시
    if (!closedUntil || now > parseInt(closedUntil)) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    
    // 7일간 재노출 금지
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const closedUntil = Date.now() + sevenDays;
    localStorage.setItem("nn_banner_until", closedUntil.toString());
    
    // 애니메이션 후 숨김
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-transform duration-300 ${
      isClosing ? "transform -translate-y-full" : ""
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Gift className="h-5 w-5" />
            <div>
              <span className="font-semibold">🎉 특별 이벤트!</span>
              <span className="ml-2 text-sm opacity-90">
                뉴스레터 구독하고 특별 혜택 받기
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Mail className="h-4 w-4 mr-1" />
              구독하기
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/10 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
