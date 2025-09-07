// 기사 공유를 위한 모달 컴포넌트
import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, newsData }) => {
  if (!isOpen || !newsData) return null;
  const newsUrl = `${window.location.origin}/news/${newsData.newsId}`;

  const copyUrl = () => {
    navigator.clipboard
      .writeText(newsUrl)
      .then(() => toast.success("URL이 복사되었습니다."))
      .catch(() => toast.error("URL 복사에 실패했습니다."));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
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
            아래 링크를 복사하여 공유할 수 있습니다.
          </p>
          <div className="flex items-center border rounded-lg p-2 bg-gray-50 mb-4">
            <input
              type="text"
              value={newsUrl}
              className="flex-1 bg-transparent outline-none text-sm text-gray-700"
              readOnly
            />
            <Button onClick={copyUrl}>복사</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
