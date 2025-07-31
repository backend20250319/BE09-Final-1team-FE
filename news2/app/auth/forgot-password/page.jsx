"use client";

import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, CheckCircle, AlertCircle, User } from "lucide-react";
import Link from "next/link";
 
export default function ForgotPasswordPage() {
  // --- 상태값 관리 영역 ---
  const [email, setEmail] = useState("");        // 사용자가 입력한 이메일
  const [name, setName] = useState("");          // 사용자가 입력한 이름
  const [isSubmitted, setIsSubmitted] = useState(false); // 발급 완료 여부
  const [isLoading, setIsLoading] = useState(false);     // 로딩(전송 중) 여부
  const [error, setError] = useState("");        // 에러 메시지

  // --- 폼 제출(임시 비밀번호 발급 요청) 핸들러 ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 이메일 형식 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("올바른 이메일 주소를 입력해주세요.");
      setIsLoading(false);
      return;
    }

    // 이름 입력 확인
    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      // (실제 구현시) 백엔드 API 호출 자리
      // await fetch('/api/forgot-password', {...})

      // 현재는 테스트용 시뮬레이션 (2초 대기)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSubmitted(true); // 발급 성공 처리
    } catch (error) {
      setError("임시 비밀번호 발급 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false); // 로딩 상태 해제
    }
  };

  // --- 재발급(다시 발급) 핸들러 ---
  const handleResendEmail = async () => {
    setIsLoading(true);
    setError("");
    try {
      // (실제 구현시) 백엔드 API 호출 자리
      // await fetch('/api/forgot-password', {...})

      // 테스트용 시뮬레이션 (1초 대기)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      setError("임시 비밀번호 재발급 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI 렌더링 영역 ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 상단: 네비게이션 및 타이틀 */}
        <div className="text-center mb-8">
          <Link
            href="/auth"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            로그인으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">NewNormalList</h1>
          <p className="text-gray-600 mt-2">개인 맞춤 뉴스 서비스</p>
        </div>

        {/* 카드 영역: 폼 or 성공 메시지 */}
        <Card>
          <CardHeader>
            {/* 상태에 따라 타이틀/설명 변경 */}
            <CardTitle>
              {isSubmitted ? "임시 비밀번호 발급 완료" : "비밀번호 찾기"}
            </CardTitle>
            <CardDescription>
              {isSubmitted
                ? "이메일을 확인해 주세요."
                : "이름과 이메일을 입력하면 임시 비밀번호를 받을 수 있습니다."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* (1) 발급 전: 입력 폼 영역 */}
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 이름 입력 */}
                <div className="space-y-2">
                  <Label htmlFor="reset-name">이름</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="reset-name"
                      type="text"
                      placeholder="이름을 입력하세요"
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                {/* 이메일 입력 */}
                <div className="space-y-2">
                  <Label htmlFor="reset-email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="이메일을 입력하세요"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                {/* 오류 메시지 영역 */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {/* 제출 버튼 */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "발급 중..." : "임시 비밀번호 발급"}
                </Button>
              </form>
            ) : (
              // (2) 발급 완료: 안내/도움말/재발급 영역
              <div className="space-y-4">
                {/* 성공 안내 메시지 */}
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{email}</strong>로 임시 비밀번호를 발송했습니다.
                  </AlertDescription>
                </Alert>

                {/* 안내 및 도움말 */}
                <div className="text-sm text-gray-600 space-y-2">
                  <p>이메일이 도착하지 않았나요?</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>스팸함 확인</li>
                    <li>이메일 주소 재확인</li>
                    <li>잠시 후 재시도</li>
                  </ul>
                  <p className="text-orange-600 font-medium">
                    💡 임시 비밀번호로 로그인 후 새 비밀번호로 변경하세요!
                  </p>
                </div>
                {/* 에러 메시지 (재발급 중 오류 등) */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {/* 재발급, 로그인 이동 버튼 */}
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "재발급 중..." : "다시 발급"}
                  </Button>
                  <Link href="/auth">
                    <Button variant="ghost" className="w-full">
                      로그인 페이지로 돌아가기
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 하단 안내: 회원가입 링크 */}
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-500">
            계정이 없으신가요?{" "}
            <Link href="/auth" className="text-blue-600 hover:underline">
              회원가입하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
