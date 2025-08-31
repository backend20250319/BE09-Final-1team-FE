"use client";

import { useState, useCallback, useRef, useEffect } from "react";

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

        const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "";
        const url = newsId != null
          ? `${base}/api/news/${encodeURIComponent(newsId)}/summary`
              : `${base}/api/news/summary`;
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(json?.message || json?.error || `요약 실패 (HTTP ${res.status})`);
            }

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
