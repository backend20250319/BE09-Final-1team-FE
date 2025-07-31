"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";

/**
 * 로그인 폼 컴포넌트
 * - 이메일과 비밀번호를 입력받아 로그인 처리
 * - 로그인 상태 유지 옵션 제공
 * - 비밀번호 찾기 링크 제공
 */
export default function LoginForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>
          계정에 로그인하여 개인 맞춤 뉴스를 확인하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 이메일 입력 필드 */}
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="email"
              type="email"
              placeholder="이메일을 입력하세요"
              className="pl-10"
            />
          </div>
        </div>

        {/* 비밀번호 입력 필드 */}
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              className="pl-10"
            />
          </div>
        </div>

        {/* 로그인 옵션 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-sm">
              로그인 상태 유지
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            비밀번호 찾기
          </Link>
        </div>

        {/* 로그인 버튼 */}
        <Button className="w-full">로그인</Button>
      </CardContent>
    </Card>
  );
}