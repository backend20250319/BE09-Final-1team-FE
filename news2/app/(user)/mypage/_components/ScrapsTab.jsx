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
import { Bookmark, Share2, Calendar, Loader2 } from "lucide-react";
import { useScrap } from "@/contexts/ScrapContext";
import Link from "next/link";

const ScrapSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="border rounded-lg p-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="flex items-center justify-end">
          <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function ScrapsTab() {
  const { scraps, removeScrap, isLoading } = useScrap();

  const renderContent = () => {
    if (isLoading) {
      return <ScrapSkeleton />;
    }

    if (scraps.length === 0) {
      return (
        <div className="text-gray-500 text-center py-12">
          <Bookmark className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold">스크랩한 뉴스가 없습니다.</h3>
          <p className="text-sm text-gray-600 mt-1">관심 있는 기사를 스크랩하여 나중에 다시 읽어보세요.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {scraps.map((news) => (
          <div
            key={news.newsId}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <Link
                href={`/news/${news.newsId}`}
                className="font-semibold text-lg hover:text-indigo-600 transition-colors cursor-pointer pr-4"
              >
                {news.title}
              </Link>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
              <Badge variant="secondary">{news.categoryName || news.category}</Badge>
              <span>{news.press || news.source}</span>
              {news.scrapedAt && (
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
                  {new Date(news.scrapedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2">
              <Link href={`/news/${news.newsId}`} passHref legacyBehavior>
                <Button variant="outline" size="sm" as="a">
                  기사 읽기
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeScrap(news.newsId)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                삭제
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bookmark className="h-5 w-5 mr-2" />
          스크랩한 뉴스
        </CardTitle>
        <CardDescription>
          관심 있는 뉴스를 저장하고 나중에 다시 읽어보세요. DB와 연동됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
