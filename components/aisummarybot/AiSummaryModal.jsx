// com// 모달창
export default function AiSummaryModal({ summary, onClose }) {
    return (
        <div
            className="fixed top-24 right-12 z-[9999] bg-white p-6 shadow-xl rounded-xl w-[400px] border border-gray-300"
            onClick={onClose}
        >
            <div onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">🤖 세 줄 요약</h2>
                    <button onClick={onClose}>×</button>
                </div>
                <div className="text-sm whitespace-pre-line text-gray-800">
                    {summary || '요약된 내용이 없습니다.'}
                </div>
                <div className="text-xs text-gray-500 border-t pt-3 mt-3">
                    ※ 아래 내용은 인공지능(ChatGPT 4.1 mini)을 통해 자동으로 요약된 결과입니다. <br />
                    AI 요약 기술의 특성상 일부 정보가 생략되거나 왜곡될 수 있으므로,
                    정확한 이해를 위해 기사 본문 전체 보기를 권장합니다.
                </div>
            </div>
        </div>
    );
}
