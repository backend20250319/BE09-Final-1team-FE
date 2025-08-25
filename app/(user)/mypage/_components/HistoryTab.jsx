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
import { getApiUrl } from "@/lib/config";
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
        getApiUrl("/api/users/mypage/history/index"),
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

      // 2. 각 뉴스 ID에 대해 뉴스 상세 정보 가져오기 (토큰 불필요)
      // API 응답은 data.content 배열 형태
      const enrichedHistory = await Promise.all(
        historyData.data.content.map(async (item) => {
          try {
            console.log(`뉴스 ${item.newsId} 정보를 가져오는 중...`);
            const newsUrl = getApiUrl(`/api/news/${item.newsId}`);
            console.log(`뉴스 API URL: ${newsUrl}`);

            const newsResponse = await fetch(newsUrl, {
              method: "GET",
              headers: {
                ...apiConfig.headers,
              },
              mode: apiConfig.mode,
              credentials: apiConfig.credentials,
            });

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
                title: newsData.data?.title || "제목 없음",
                category: newsData.data?.category || "분류 없음",
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
              const errorText = await newsResponse.text();
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
            return {
              id: item.newsId,
              title: "정보를 불러올 수 없음",
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
        })
      );

      setReadingHistory(enrichedHistory);
    } catch (error) {
      console.error("읽기 기록을 가져오는데 실패했습니다:", error);
      setError(error.message);
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
