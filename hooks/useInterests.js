import { useState, useEffect } from "react";
import { CategoriesResponseSchema } from "@/lib/schemas";

// 기본 관심사 데이터 (백엔드 Category enum과 1:1 매칭)
const DEFAULT_INTERESTS = [
  { id: "POLITICS", icon: "🏛️", categoryName: "정치" },
  { id: "ECONOMY", icon: "💰", categoryName: "경제" },
  { id: "SOCIETY", icon: "👥", categoryName: "사회" },
  { id: "LIFE", icon: "🎭", categoryName: "생활" },
  { id: "INTERNATIONAL", icon: "🌍", categoryName: "세계" },
  { id: "IT_SCIENCE", icon: "💻", categoryName: "IT/과학" },
  { id: "VEHICLE", icon: "🚗", categoryName: "자동차/교통" },
  { id: "TRAVEL_FOOD", icon: "🧳", categoryName: "여행/음식" },
  { id: "ART", icon: "🎨", categoryName: "예술" },
];

/**
 * 관심사(카테고리) 목록을 가져오는 커스텀 훅
 * API 호출이 실패하면 fallback 데이터를 사용합니다.
 *
 * @returns {Object} { interests, isLoading, error, refetch }
 */
export function useInterests() {
  const [interests, setInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInterests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/users/categories");
      if (!res.ok) throw new Error(`API 요청 실패: ${res.status}`);

      const json = await res.json().catch(() => ({}));

      // zod 스키마 검증
      try {
        const parsed = CategoriesResponseSchema.parse(json);
        setInterests(parsed.data);
        console.log(
          "✅ 관심사 목록 API에서 로드됨:",
          parsed.data.length + "개"
        );
      } catch (validationError) {
        console.error("카테고리 API 응답 스키마 불일치:", validationError);
        throw new Error("카테고리 데이터 형식이 올바르지 않습니다");
      }
    } catch (fetchError) {
      console.warn(
        "⚠️ 관심사 API 호출 실패, fallback 데이터 사용:",
        fetchError.message
      );
      setError(fetchError.message);
      // 폴백: 하드코드 목록 사용
      setInterests(DEFAULT_INTERESTS);
      console.log(
        "🔄 fallback 관심사 목록 사용:",
        DEFAULT_INTERESTS.length + "개"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  // 다시 시도 함수
  const refetch = () => {
    fetchInterests();
  };

  return {
    interests,
    isLoading,
    error,
    refetch,
  };
}
