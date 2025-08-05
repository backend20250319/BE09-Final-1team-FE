/**
 * 프로필 사이드바 컴포넌트
 * - 사용자 아바타, 이름, 이메일 표시
 * - 가입일, 읽은 기사 수, 스크랩 수 등 통계 정보
 */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProfileSidebar() {
  return (
    <Card>
      <CardContent className="pt-6">
        {/* 사용자 프로필 정보 */}
        <div className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src="/placeholder.svg?height=96&width=96" />
            <AvatarFallback className="text-lg">김사용자</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold">김사용자</h2>
          <p className="text-gray-600">user@example.com</p>
          <Badge className="mt-2">일반 회원</Badge>
        </div>

        <Separator className="my-6" />

        {/* 사용자 통계 정보 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">가입일</span>
            <span className="text-sm font-medium">2024.01.10</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">읽은 기사</span>
            <span className="text-sm font-medium">127개</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">스크랩</span>
            <span className="text-sm font-medium">23개</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
