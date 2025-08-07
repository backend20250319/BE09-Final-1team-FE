// 버튼
import { useState } from 'react';
import Image from 'next/image';
import AiSummaryModal from './AiSummaryModal';
import useSummary from './useSummary';

export default function AiSummaryButton({ newsId }) {
    const [isOpen, setIsOpen] = useState(false);
    const { summary, fetchSummary, loading, error } = useSummary(newsId);

    const handleClick = async () => {
        if (!summary) {
            await fetchSummary(newsId, prompt); // 프롬프트와 함께 호출
        }
        setIsOpen(true);
    };

    return (
        <div className="space-y-2">
            <div className="relative">
                <Image
                    src="/images/summarybot.png"
                    alt="AI 요약봇"
                    width={32}
                    height={32}
                    className="cursor-pointer hover:scale-110 transition-transform duration-200"
                    onClick={handleClick}
                />
                {loading && (
                    <div className="absolute top-0 left-10 text-xs text-gray-500 animate-pulse">
                        요약 중...
                    </div>
                )}
            </div>

            {/* 모달 */}
            {isOpen && (
                <AiSummaryModal
                    summary={summary}
                    onClose={() => setIsOpen(false)}
                />
            )}

            {/* 에러 메시지 */}
            {error && <div className="text-red-500 text-sm mt-2">⚠ {error}</div>}
        </div>
    );
}