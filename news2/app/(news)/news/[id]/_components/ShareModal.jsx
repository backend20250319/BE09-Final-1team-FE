"use client";

import React from 'react';
import { X } from "lucide-react";
import { toast } from "sonner";

const ShareModal = ({ isOpen, onClose, newsData }) => {
  if (!isOpen) return null;

  const copyUrl = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      toast.success("URL이 복사되었습니다.");
    }).catch(err => {
      console.error("Failed to copy text: ", err);
      toast.error("URL 복사에 실패했습니다.");
    });
  };

  const shareOnKakao = () => {
    toast.info("카카오톡 공유는 SDK 연동이 필요합니다. 기사 URL이 복사되었습니다.");
    copyUrl();
  };

  const shareOnFacebook = () => {
    const currentUrl = window.location.href;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(newsData.title)}`;
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const shareOnTwitter = () => {
    const currentUrl = window.location.href;
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(newsData.title)}`;
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const shareOnInstagram = () => {
    toast.info("인스타그램은 웹에서 직접 공유하기 어렵습니다. 기사 URL이 복사되었습니다.");
    copyUrl();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">기사 공유하기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            아래 링크를 복사하거나 SNS로 공유할 수 있습니다.
          </p>
          <div className="flex items-center border rounded-lg p-2 bg-gray-50 mb-4">
            <input
              type="text"
              value={typeof window !== "undefined" ? window.location.href : ""}
              className="flex-1 bg-transparent outline-none text-sm text-gray-700"
              readOnly
            />
            <button
              onClick={copyUrl}
              className="bg-indigo-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-indigo-600 transition-colors"
            >
              복사
            </button>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={shareOnKakao}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FEE500] hover:opacity-80 transition-opacity"
            >
              <img
                src="/images/Kakaotalk.png"
                alt="카카오톡"
                className="w-8 h-8"
              />
            </button>
            <button
              onClick={shareOnFacebook}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-[#1877F2] hover:opacity-80 transition-opacity"
            >
              <img
                src="/images/Facebook.png"
                alt="페이스북"
                className="w-8 h-8"
              />
            </button>
            <button
              onClick={shareOnTwitter}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200 hover:opacity-80 transition-opacity"
            >
              <img
                src="/images/Twitter.png"
                alt="트위터"
                className="w-8 h-8"
              />
            </button>
            <button
              onClick={shareOnInstagram}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-[#E4405F] hover:opacity-80 transition-opacity"
            >
              <img
                src="/images/Instagram.png"
                alt="인스타그램"
                className="w-8 h-8"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
