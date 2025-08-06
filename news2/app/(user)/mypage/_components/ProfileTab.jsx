/**
 * 프로필 관리 탭 컴포넌트
 * - 기본 정보 수정 (이름, 이메일, 자기소개)
 * - 보안 설정 (비밀번호 변경)
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, Edit2 } from "lucide-react";

export default function ProfileTab() {
  return (
    <div className="space-y-6">
      {/* 기본 정보 수정 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            기본 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">이름</Label>
              <Input id="name" defaultValue="김사용자" />
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input id="email" defaultValue="user@example.com" type="email" />
            </div>
          </div>
          <div>
            <Label htmlFor="bio">자기소개</Label>
            <Input id="bio" placeholder="간단한 자기소개를 입력하세요" />
          </div>
          <Button>
            <Edit2 className="h-4 w-4 mr-2" />
            정보 수정
          </Button>
        </CardContent>
      </Card>

      {/* 보안 설정 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            보안 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password">현재 비밀번호</Label>
            <Input id="current-password" type="password" />
          </div>
          <div>
            <Label htmlFor="new-password">새 비밀번호</Label>
            <Input id="new-password" type="password" />
          </div>
          <div>
            <Label htmlFor="confirm-password">비밀번호 확인</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button>비밀번호 변경</Button>
        </CardContent>
      </Card>
    </div>
  );
}
