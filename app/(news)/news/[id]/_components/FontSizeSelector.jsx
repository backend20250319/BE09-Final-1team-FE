// 글자 크기를 선택하는 UI 컴포넌트
'use client';

import React, { useEffect, useRef } from 'react';

const fontSizes = [
  { id: "sm", label: "아주 작게", value: 14 },
  { id: "base", label: "작게", value: 16 },
  { id: "lg", label: "보통", value: 18 },
  { id: "xl", label: "크게", value: 20 },
  { id: "2xl", label: "아주 크게", value: 22 },
];

const FontSizeSelector = ({ currentValue, onSelect, onClose }) => {
  const selectorRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectorRef, onClose]);

  return (
    <div
      ref={selectorRef}
      className="absolute bottom-full left-1/2 z-20 mb-2 w-80 -translate-x-1/2 transform"
    >
      <div className="relative rounded-xl bg-white p-6 shadow-lg ring-1 ring-black ring-opacity-5">
        <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-white"></div>
        <div className="relative flex flex-col items-center">
          <div className="relative flex w-full items-center justify-between">
            <div className="absolute left-0 top-1/2 w-full -translate-y-1/2">
              <div className="mx-auto h-0.5 w-[calc(100%-2rem)] bg-gray-200"></div>
            </div>
            {fontSizes.map((sizeOption) => {
              const isSelected = currentValue === sizeOption.value;
              return (
                <button
                  key={sizeOption.id}
                  onClick={() => {
                    onSelect(sizeOption.value);
                    onClose();
                  }}
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-indigo-400"
                  }`}
                >
                  가
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex w-full justify-between px-1">
            {fontSizes.map((sizeOption) => (
              <div
                key={sizeOption.id}
                className={`w-10 text-center text-xs font-medium text-gray-500 whitespace-nowrap ${
                  currentValue === sizeOption.value &&
                  "font-bold text-indigo-500"
                }`}
              >
                {sizeOption.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontSizeSelector;
