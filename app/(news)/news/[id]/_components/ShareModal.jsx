// 기사 URL 공유 모달 컴포넌트
'use client';

import React from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';

const ShareModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const copyUrlToClipboard = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        toast.success("URL이 복사되었습니다.");
        onClose();
      })
      .catch(() => {
        const textarea = document.createElement("textarea");
        textarea.value = currentUrl;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          toast.success("URL이 복사되었습니다.");
          onClose();
        } catch (err) {
          toast.error("URL 복사에 실패했습니다.");
        } finally {
          document.body.removeChild(textarea);
        }
      });
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
          <h2 className="text-xl font-bold">기사 URL 복사</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            아래 버튼을 눌러 기사 URL을 복사할 수 있습니다.
          </p>
          <div className="flex items-center border rounded-lg p-2 bg-gray-50">
            <input
              type="text"
              value={typeof window !== "undefined" ? window.location.href : ""}
              className="flex-1 bg-transparent outline-none text-sm text-gray-700"
              readOnly
            />
            <button
              onClick={copyUrlToClipboard}
              className="bg-indigo-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-indigo-600 transition-colors"
            >
              복사
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
