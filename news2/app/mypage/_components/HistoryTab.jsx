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
import { Clock } from "lucide-react";

export default function HistoryTab() {
  // 읽기 기록 데이터 (실제로는 props나 API에서 가져올 데이터)
  const readingHistory = [
    {
      id: 1,
      title: "스타트업 투자 동향 분석",
      category: "경제",
      readAt: "2024-01-15 14:30",
      readTime: "3분",
    },
    {
      id: 2,
      title: "새로운 교육 정책 발표",
      category: "사회",
      readAt: "2024-01-15 10:15",
      readTime: "5분",
    },
    {
      id: 3,
      title: "기후변화 대응 기술 개발",
      category: "IT/과학",
      readAt: "2024-01-14 16:45",
      readTime: "4분",
    },
  ];

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
      </CardContent>
    </Card>
  );
}
