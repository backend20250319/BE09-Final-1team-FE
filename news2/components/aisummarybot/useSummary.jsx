// 훅

import * as React from "react"

export default function useSummary(newsId) {
    const [summary, setSummary] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)

    const fetchSummary = async (newsId, prompt) => {
        if (loading || summary) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/news/${newsId}/summary`,);
            const data = await res.text();
            setSummary(data.summary_text);
        } catch (err) {
            const text = await err?.response?.text?.();
            setError("요약 실패: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return { summary, fetchSummary, loading, error }
}
