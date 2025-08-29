"use client";

import React from 'react';
import { Bot, X } from "lucide-react";

const SummaryModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bot className="text-indigo-500" /> AI 요약봇
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <h3 className="font-semibold text-lg mb-3">핵심 요약</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              정부가 중소기업 지원, 기술 혁신, 내수 활성화를 골자로 하는
              새로운 경제 정책을 발표했습니다.
            </li>
            <li>
              기술 혁신 분야(AI, 바이오, 친환경 에너지)에 대한 집중 투자는
              미래 성장 동력 확보를 목표로 합니다.
            </li>
            <li>
              내수 활성화를 위해 지역 화폐 확대 및 소상공인 지원책을
              포함했으나, 재정 건전성 우려도 존재합니다.
            </li>
            <li>
              전문가들은 정책의 장기적 성공이 구체적인 실행 방안과 글로벌
              경제 상황에 달려있다고 분석합니다.
            </li>
          </ul>
        </div>
        <div className="p-4 bg-gray-50 rounded-b-2xl text-center text-sm text-gray-500">
          <p>
            이 요약은 AI가 생성한 내용으로, 일부 부정확한 정보가 포함될 수
            있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;
