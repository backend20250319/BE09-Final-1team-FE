"use client";
import Image from "next/image";

export default function AiSummaryButton({ onClick, size = 32 }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="p-1 rounded-full hover:scale-105 transition"
            title="AI 세 줄 요약"
        >
            <Image
                src="/images/summarybot2.svg"
                alt="AI 요약봇"
                width={100}
                height={100}
                className="cursor-pointer"
                priority
            />
        </button>
    );
}
