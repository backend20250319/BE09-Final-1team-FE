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
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 이메일 유효성 검사
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
      // TODO: 백엔드 API 호출 - 임시 비밀번호 발급
      // const response = await fetch('/api/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, name })
      // });

      // 임시 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (error) {
      setError("임시 비밀번호 발급 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError("");

    try {
      // TODO: 백엔드 API 호출 - 임시 비밀번호 재발급
      // const response = await fetch('/api/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, name })
      // });

      // 임시 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      setError("임시 비밀번호 재발급 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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

        <Card>
          <CardHeader>
            <CardTitle>
              {isSubmitted ? "임시 비밀번호가 발급되었습니다" : "비밀번호 찾기"}
            </CardTitle>
            <CardDescription>
              {isSubmitted
                ? "임시 비밀번호를 이메일로 보내드렸습니다."
                : "이름과 계정에 등록된 이메일 주소를 입력하시면 임시 비밀번호를 발급해드립니다."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-name">이름</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="reset-name"
                      type="text"
                      placeholder="등록된 이름을 입력하세요"
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">이메일 주소</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="등록된 이메일을 입력하세요"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "발급 중..." : "임시 비밀번호 발급"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{email}</strong> 주소로 임시 비밀번호를
                    보내드렸습니다. 이메일을 확인하여 로그인 후 비밀번호를
                    변경해주세요.
                  </AlertDescription>
                </Alert>

                <div className="text-sm text-gray-600 space-y-2">
                  <p>임시 비밀번호가 도착하지 않았나요?</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>스팸함을 확인해보세요</li>
                    <li>이메일 주소가 정확한지 확인해보세요</li>
                    <li>몇 분 후에 다시 시도해보세요</li>
                  </ul>
                  <p className="text-orange-600 font-medium">
                    ⚠️ 임시 비밀번호로 로그인 후 반드시 새 비밀번호로
                    변경해주세요!
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "재발급 중..." : "임시 비밀번호 다시 발급"}
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

        {/* 추가 도움말 */}
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
