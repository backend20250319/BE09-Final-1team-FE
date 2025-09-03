'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Loader2, Newspaper } from "lucide-react";
import { useMypageContext } from "@/contexts/MypageContext";
import Link from 'next/link';
import Image from 'next/image';

const categoryMap = {
  "POLITICS": "정치",
  "ECONOMY": "경제",
  "SOCIETY": "사회",
  "LIFE": "생활",
  "INTERNATIONAL": "세계",
  "IT_SCIENCE": "IT/과학",
  "VEHICLE": "자동차/교통",
  "TRAVEL_FOOD": "여행/음식",
  "ART": "예술",
};

const translateCategory = (category) => categoryMap[category] || category;

export default function HistoryTab() {
  const { history, isLoadingHistory, historyError } = useMypageContext();

  if (isLoadingHistory) {
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

  if (historyError) {
    const isAuthError = historyError.includes("로그인") || historyError.includes("인증");
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
            <p className="text-sm text-gray-600 mb-4">{historyError}</p>
            {isAuthError && (
              <button
                onClick={() => (window.location.href = "/auth/login")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                로그인하기
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const enrichedHistory = history.map((item) => ({
    id: item.newsId,
    title: item.newsTitle || "제목 없음",
    category: translateCategory(item.categoryName) || "분류 없음",
    readAt: new Date(item.updatedAt).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    imageUrl: item.imageUrl,
  }));

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
        {enrichedHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">아직 읽은 뉴스가 없습니다.</p>
            <p className="text-sm text-gray-500 mt-2">뉴스를 읽어보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enrichedHistory.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border rounded-lg p-4 transition-shadow hover:shadow-md">
                <Link href={`/news/${item.id}`} passHref legacyBehavior>
                  <a className="w-24 h-24 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center hover:bg-gray-200 transition-colors relative overflow-hidden">
                    {item.imageUrl ? <Image src={item.imageUrl} alt={item.title} layout="fill" className="object-cover" /> : <Newspaper className="w-8 h-8 text-gray-400" />}
                  </a>
                </Link>
                <div className="flex-grow overflow-hidden">
                  <h3 className="font-semibold truncate">
                    <Link href={`/news/${item.id}`} className="hover:text-blue-600 cursor-pointer">
                      {item.title}
                    </Link>
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <span className="flex items-center truncate">
                      <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                      {item.readAt}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}