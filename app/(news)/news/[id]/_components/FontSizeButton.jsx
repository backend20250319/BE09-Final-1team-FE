// 글자 크기 선택 UI를 여는 버튼 컴포넌트
'use client';

import React from 'react';

const FontSizeButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
      aria-label="글자 크기 변경하기"
    >
      <div className="flex items-baseline">
        <span className="ml-0.5 text-xs font-semibold text-gray-600">가</span>
        <span className="text-lg font-semibold text-gray-800">가</span>
      </div>
    </button>
  );
};

export default FontSizeButton;
