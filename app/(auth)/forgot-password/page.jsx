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
  const [email, setEmail] = useState(""); // 사용자가 입력한 이메일
  const [name, setName] = useState(""); // 사용자가 입력한 이름
  const [isSubmitted, setIsSubmitted] = useState(false); // 발급 완료 여부
  const [isLoading, setIsLoading] = useState(false); // 로딩(전송 중) 여부
  const [error, setError] = useState(""); // 에러 메시지
  const [successMessage, setSuccessMessage] = useState(""); // 성공 메시지 (재발급 시 사용)


  /**
   * 백엔드에 비밀번호 재설정 링크 발급을 요청하는 공통 함수
   * @returns {Promise<boolean>} API 요청 성공 여부
   */
  const requestResetLink = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage(""); // 메시지 초기화

    // 이메일 형식 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("올바른 이메일 주소를 입력해주세요.");
      setIsLoading(false);
      return false;
    }

    // 이름 입력 확인
    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      setIsLoading(false);
      return false;
    }

    try {
      // 환경변수에서 API 기본 URL 가져오기
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // API 호출
      const response = await fetch(`${apiUrl}/api/auth/password/find`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: name, email: email }),
      });

      const result = await response.json();

      if (!response.ok) {
        // 서버에서 보낸 에러 메시지가 있다면 사용, 없다면 기본 메시지
        throw new Error(result.message || "알 수 없는 오류가 발생했습니다.");
      }
      
      return true; // 성공적으로 요청 완료

    } catch (err) {
      setError(err.message || "재설정 링크 발송 중 오류가 발생했습니다. 다시 시도해주세요.");
      return false; // 요청 실패
    } finally {
      setIsLoading(false); // 로딩 상태 해제
    }
  };


  // --- 폼 첫 제출 핸들러 ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await requestResetLink();
    if (success) {
      setIsSubmitted(true); // 성공 시, 완료 화면으로 전환
    }
  };

  // --- 재발급 핸들러 ---
  const handleResendEmail = async () => {
    const success = await requestResetLink();
    if (success) {
        setSuccessMessage("재설정 링크를 다시 발송했습니다."); // 재발급 성공 메시지 표시
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
          <h1 className="text-3xl font-bold font-logo text-gray-900">NewSphere</h1>
          <p className="text-gray-600 mt-2">개인 맞춤 뉴스 서비스</p>
        </div>

        {/* 카드 영역: 폼 or 성공 메시지 */}
        <Card>
          <CardHeader>
            {/* 상태에 따라 타이틀/설명 변경 */}
            <CardTitle>
              {isSubmitted ? "발송 완료" : "비밀번호 찾기"}
            </CardTitle>
            <CardDescription>
              {isSubmitted
                ? "입력하신 이메일의 메일함을 확인해 주세요."
                : "이름과 이메일을 입력하면 비밀번호 재설정 링크를 받을 수 있습니다."}
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
                      placeholder="가입 시 등록한 이름을 입력하세요"
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
                      placeholder="가입 시 등록한 이메일을 입력하세요"
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
                  {isLoading ? "발급 중..." : "비밀번호 재설정 링크 받기"}
                </Button>
              </form>
            ) : (
              // (2) 발급 완료: 안내/도움말/재발급 영역
              <div className="space-y-4">
                {/* 성공 안내 메시지 */}
                <Alert variant="default">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    <strong>{email}</strong>로 비밀번호 재설정 링크를 발송했습니다.
                  </AlertDescription>
                </Alert>

                {/* 안내 및 도움말 */}
                <div className="text-sm text-gray-600 space-y-2 p-2">
                  <p className="font-semibold">이메일이 도착하지 않았나요?</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>메일함의 <strong>스팸함</strong>을 확인해 주세요.</li>
                    <li>입력한 정보가 가입 정보와 일치하는지 확인해 주세요.</li>
                    <li>링크는 발급 후 <strong>24시간 동안</strong> 유효합니다.</li>
                  </ul>
                </div>

                {/* 재발급 성공 또는 오류 메시지 영역 */}
                 {successMessage && !error && (
                    <Alert variant="default" className="bg-blue-50 border-blue-200">
                        <CheckCircle className="h-4 w-4 text-blue-500"/>
                        <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* 재발급, 로그인 이동 버튼 */}
                <div className="flex flex-col space-y-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "재발급 중..." : "링크 다시 받기"}
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/auth">
                      로그인 페이지로 돌아가기
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}