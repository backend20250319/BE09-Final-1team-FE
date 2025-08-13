/**
 * 읽기 기록 탭 컴포넌트
 * - 최근에 읽은 뉴스 기록 표시
 * - 읽은 시간, 소요 시간 등 정보 포함
 */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { newsService } from "@/lib/newsService";
import { apiConfig } from "@/lib/api-utils";
import { authenticatedFetch } from "@/lib/auth";

export default function HistoryTab() {
  const [readingHistory, setReadingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 읽기 기록 데이터 가져오기
  const fetchReadingHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. 읽기 기록 가져오기 (뉴스 ID와 날짜) - authenticatedFetch 사용
      const historyResponse = await authenticatedFetch(
        "/api/users/mypage/history/index",
        {
          method: "GET",
          headers: {
            ...apiConfig.headers,
          },
          mode: apiConfig.mode,
          credentials: apiConfig.credentials,
        }
      );

      // authenticatedFetch에서 인증 실패한 경우 (객체 형태로 반환)
      if (historyResponse.success === false) {
        throw new Error(historyResponse.message);
      }

      // 일반 fetch Response 객체인 경우
      if (!historyResponse.ok) {
        throw new Error(
          `읽기 기록을 가져오는데 실패했습니다: ${historyResponse.status}`
        );
      }

      const historyData = await historyResponse.json();

      // 데이터 구조 검증
      if (
        !historyData ||
        !historyData.data ||
        !Array.isArray(historyData.data.content)
      ) {
        console.warn("예상과 다른 데이터 구조:", historyData);
        setReadingHistory([]);
        return;
      }

      // 빈 배열인 경우 처리
      if (historyData.data.content.length === 0) {
        setReadingHistory([]);
        return;
      }

      // 2. 각 뉴스 ID에 대해 뉴스 상세 정보 가져오기 (토큰 불필요)
      // Promise.all 대신 Promise.allSettled 사용하여 일부 실패해도 계속 진행
      const historyPromises = historyData.data.content.map(async (item) => {
        try {
          // 데이터 유효성 검사
          if (!item || !item.newsId) {
            console.warn("유효하지 않은 히스토리 아이템:", item);
            return null;
          }

          console.log(`뉴스 ${item.newsId} 정보를 가져오는 중...`);
          // Next.js rewrites를 활용하여 CORS 문제 해결
          const newsUrl = `/api/news/${item.newsId}`;
          console.log(`뉴스 API URL: ${newsUrl}`);

          // 타임아웃 설정 (10초)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const newsResponse = await fetch(newsUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          console.log(
            `뉴스 ${item.newsId} 응답 상태:`,
            newsResponse.status,
            newsResponse.statusText
          );

          if (newsResponse.ok) {
            const newsData = await newsResponse.json();
            console.log(`뉴스 ${item.newsId} 데이터:`, newsData);
            return {
              id: item.newsId,
              title: newsData.title || "제목 없음",
              category: newsData.categoryName || "분류 없음",
              readAt: new Date(item.updatedAt).toLocaleString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
              readTime: "읽음", // readTime 필드가 없으므로 기본값
            };
          } else {
            console.log(
              `뉴스 ${item.newsId} 가져오기 실패:`,
              newsResponse.status,
              newsResponse.statusText
            );

            // 응답 텍스트 읽기 시도
            let errorText = "알 수 없는 오류";
            try {
              errorText = await newsResponse.text();
            } catch (e) {
              console.warn("에러 응답 텍스트를 읽을 수 없음:", e);
            }

            console.log(`뉴스 ${item.newsId} 에러 응답:`, errorText);

            // 뉴스 정보를 가져올 수 없는 경우 기본값 사용
            return {
              id: item.newsId,
              title: "삭제된 뉴스",
              category: "알 수 없음",
              readAt: new Date(item.updatedAt).toLocaleString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
              readTime: "읽음",
            };
          }
        } catch (newsError) {
          console.error(
            `뉴스 ${item.newsId} 정보를 가져오는데 실패:`,
            newsError
          );

          // AbortError는 타임아웃으로 간주
          const errorTitle =
            newsError.name === "AbortError"
              ? "요청 시간 초과"
              : "정보를 불러올 수 없음";

          return {
            id: item.newsId,
            title: errorTitle,
            category: "알 수 없음",
            readAt: new Date(item.updatedAt).toLocaleString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
            readTime: "읽음",
          };
        }
      });

      // Promise.allSettled를 사용하여 모든 결과를 기다림
      const results = await Promise.allSettled(historyPromises);

      // 성공한 결과만 필터링
      const enrichedHistory = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value)
        .filter((item) => item !== null && item !== undefined);

      setReadingHistory(enrichedHistory);
    } catch (error) {
      console.error("읽기 기록을 가져오는데 실패했습니다:", error);

      // 네트워크 에러 vs API 에러 구분
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setError(
          "네트워크 연결을 확인해주세요. 서버와의 연결에 문제가 있습니다."
        );
      } else if (
        error.message.includes("인증") ||
        error.message.includes("로그인")
      ) {
        setError("로그인이 필요합니다. 다시 로그인해주세요.");
      } else {
        setError(error.message || "읽기 기록을 불러오는데 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReadingHistory();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            읽기 기록
          </CardTitle>
          <CardDescription>최근에 읽은 뉴스 기록을 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>읽기 기록을 불러오는 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    const isAuthError = error.includes("로그인") || error.includes("인증");

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            읽기 기록
          </CardTitle>
          <CardDescription>최근에 읽은 뉴스 기록을 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">
              {isAuthError ? "인증 오류" : "오류가 발생했습니다"}
            </p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            {isAuthError ? (
              <button
                onClick={() => (window.location.href = "/auth/login")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                로그인하기
              </button>
            ) : (
              <button
                onClick={fetchReadingHistory}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                다시 시도
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          읽기 기록
        </CardTitle>
        <CardDescription>최근에 읽은 뉴스 기록을 확인하세요</CardDescription>
      </CardHeader>
      <CardContent>
        {readingHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">아직 읽은 뉴스가 없습니다.</p>
            <p className="text-sm text-gray-500 mt-2">뉴스를 읽어보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {readingHistory.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                {/* 뉴스 제목과 읽기 소요 시간 */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold hover:text-blue-600 cursor-pointer">
                    {item.title}
                  </h3>
                  <span className="text-sm text-gray-500">{item.readTime}</span>
                </div>

                {/* 카테고리와 읽은 시간 */}
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <Badge variant="outline">{item.category}</Badge>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {item.readAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}