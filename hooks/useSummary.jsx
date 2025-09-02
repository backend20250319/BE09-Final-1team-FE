"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { authenticatedFetch } from "@/lib/auth";

/**
 * 요약 훅 (항상 POST /api/news/summary)
 * - body.newsId 있으면: ID 기반 요약(캐시 우선, force 지원)
 * - body.text  있으면: 텍스트 임시 요약(DB 미저장)
 * - 둘 다 오면: ID 우선
 */
export default function useSummary() {
    const [data, setData] = useState(null);     // { summary, cached, stale, newsId, ... }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const ctrlRef = useRef(null);
 
    const requestSummary = useCallback(async (opts = {}) => {
        const {
            newsId,
            text,
            type,
            lines = 3,
            prompt = null,
            force = false,
        } = opts;

        if (newsId == null && (!text || !`${text}`.trim())) {
            setError("newsId 또는 text 중 하나는 필요합니다.");
            return null;
        }

        if (ctrlRef.current) ctrlRef.current.abort();
        const controller = new AbortController();
        ctrlRef.current = controller;

        setLoading(true);
        setError("");

        const body = newsId != null
          ? { ...(type ? { type } : {}), lines, prompt, force }
          : { text: text ?? "", ...(type ? { type } : {}), lines, prompt };

        const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/,""); // 빈 값 허용하지 말기
        const url = newsId != null
          ? `${base}/api/news/${encodeURIComponent(newsId)}/summary`
              : `${base}/api/news/summary`;
        try {
            // useSummary.jsx 요청부만 교체
            const res = await fetch(`${base}/api/news/${encodeURIComponent(newsId)}/summary`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept":"application/json" },
                body: JSON.stringify({ type: type || "DEFAULT", lines, ...(prompt?{prompt}:{}), force }),
                signal: controller.signal,
            });

            if (!res || typeof res.json !== "function") {
                  throw new Error("요약 요청에 실패했습니다. (인증 필요 또는 서버 응답 형식 오류)");
                }
            const json = await res.json().catch(() => ({}));

            setData(json);
            return json;
        } catch (e) {
            if (e?.name === "AbortError") return null;
            setError(e?.message || "요약 중 오류가 발생했습니다.");
            return null;
        } finally {
            setLoading(false);
            if (ctrlRef.current === controller) ctrlRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setError("");
        setLoading(false);
    }, []);

    useEffect(() => () => ctrlRef.current?.abort(), []);

    return { data, loading, error, requestSummary, reset };
}
