import { useState, useEffect } from "react";
import { CategoriesResponseSchema } from "@/lib/schemas";

// 기본 관심사 데이터 (백엔드 Category enum과 1:1 매칭)
const DEFAULT_INTERESTS = [
  { categoryCode: "POLITICS", icon: "🏛️", categoryName: "정치" },
  { categoryCode: "ECONOMY", icon: "💰", categoryName: "경제" },
  { categoryCode: "SOCIETY", icon: "👥", categoryName: "사회" },
  { categoryCode: "LIFE", icon: "🎭", categoryName: "생활" },
  { categoryCode: "INTERNATIONAL", icon: "🌍", categoryName: "세계" },
  { categoryCode: "IT_SCIENCE", icon: "💻", categoryName: "IT/과학" },
  { categoryCode: "VEHICLE", icon: "🚗", categoryName: "자동차/교통" },
  { categoryCode: "TRAVEL_FOOD", icon: "🧳", categoryName: "여행/음식" },
  { categoryCode: "ART", icon: "🎨", categoryName: "예술" },
];

/**
 * 관심사(카테고리) 목록을 가져오는 커스텀 훅
 * 백엔드 API에서 직접 가져오며, 실패하면 fallback 데이터를 사용합니다.
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

      // Next.js API 라우트를 통해 카테고리 호출 (인증 불필요)
      console.log("🔍 카테고리 API 호출: /api/categories");

      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error(`API 요청 실패: ${res.status}`);

      const json = await res.json().catch(() => ({}));

      // API 응답 구조에 맞게 수정
      if (json.success && json.data) {
        setInterests(json.data);
        console.log("✅ 관심사 목록 API에서 로드됨:", json.data.length + "개");
      } else {
        // zod 스키마 검증을 fallback으로 시도
        try {
          const parsed = CategoriesResponseSchema.parse(json);
          setInterests(parsed.data);
          console.log(
            "✅ 관심사 목록 스키마 검증 통과:",
            parsed.data.length + "개"
          );
        } catch (validationError) {
          console.error("API 응답 스키마 불일치:", validationError);
          throw new Error("카테고리 데이터 형식이 올바르지 않습니다");
        }
      }
    } catch (fetchError) {
      console.warn(
        "⚠️ 카테고리 API 호출 실패, fallback 데이터 사용:",
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
