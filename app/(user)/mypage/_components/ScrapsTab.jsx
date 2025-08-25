/**
 * 스크랩 관리 탭 컴포넌트
 * - 스크랩한 뉴스 목록 표시
 * - 각 뉴스별 읽기, 공유, 삭제 기능
 */

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Share2, Calendar } from "lucide-react";
import { useScrap } from "@/contexts/ScrapContext";
import Link from "next/link";

export default function ScrapsTab() {
  const { scraps, removeScrap } = useScrap();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bookmark className="h-5 w-5 mr-2" />
          스크랩한 뉴스
        </CardTitle>
        <CardDescription>
          관심 있는 뉴스를 저장하고 나중에 다시 읽어보세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scraps.length === 0 ? (
            <div className="text-gray-500 text-center py-8">스크랩한 뉴스가 없습니다.</div>
          ) : (
            scraps.map((news) => (
              <div
                key={news.newsId}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* 뉴스 제목과 공유 버튼 */}
                <div className="flex justify-between items-start mb-2">
                  <Link
                    href={`/news/${news.newsId}`}
                    className="font-semibold text-lg hover:text-blue-600 cursor-pointer"
                  >
                    {news.title}
                  </Link>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* 뉴스 메타 정보 */}
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <Badge variant="outline">{news.category}</Badge>
                  <span>{news.source}</span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {news.scrapedAt}
                  </span>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex items-center justify-end">
                  <Link href={`/news/${news.newsId}`} passHref legacyBehavior>
                    <Button variant="outline" size="sm" as="a">
                      읽기
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeScrap(news.newsId)}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
