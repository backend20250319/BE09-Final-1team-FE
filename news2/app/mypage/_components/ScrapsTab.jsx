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

export default function ScrapsTab() {
  // 스크랩한 뉴스 데이터 (실제로는 props나 API에서 가져올 데이터)
  const scrapedNews = [
    {
      id: 1,
      title: "AI 기술의 급속한 발전과 미래 전망",
      category: "IT/과학",
      source: "테크뉴스",
      scrapedAt: "2024-01-15",
      folder: "AI 관련",
    },
    {
      id: 2,
      title: "2024년 경제 정책 변화 분석",
      category: "경제",
      source: "경제일보",
      scrapedAt: "2024-01-14",
      folder: "경제 동향",
    },
    {
      id: 3,
      title: "환경보호 정책의 새로운 방향",
      category: "사회",
      source: "환경뉴스",
      scrapedAt: "2024-01-13",
      folder: "환경",
    },
  ];

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
          {scrapedNews.map((news) => (
            <div
              key={news.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* 뉴스 제목과 공유 버튼 */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer">
                  {news.title}
                </h3>
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

              {/* 폴더 정보와 액션 버튼들 */}
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{news.folder}</Badge>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    읽기
                  </Button>
                  <Button variant="ghost" size="sm">
                    삭제
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
