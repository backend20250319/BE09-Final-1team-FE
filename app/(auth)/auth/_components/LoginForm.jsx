"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { login, getUserInfo } from "@/lib/auth/auth";
import Link from "next/link";
import KakaoLoginButton from "@/components/auth/KakaoLoginButton";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 인증 상태 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userInfo = getUserInfo();
        if (userInfo) {
          console.log('🔍 이미 로그인된 사용자 감지:', userInfo);
          
          // 유효한 사용자면 리다이렉트
          if (userInfo.role === 'admin') {
            router.replace('/admin');
          } else {
            router.replace('/');
          }
          return; // 리다이렉트하므로 여기서 끝
        }
      } catch (error) {
        console.warn('⚠️ 인증 상태 확인 실패:', error);
        // 에러 발생 시 localStorage 정리
        localStorage.clear();
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("로그인 시도:", { email, password: "***" });
      const result = await login(email, password);
      console.log("로그인 결과:", result);

      if (result.success) {
        console.log("로그인 성공, 역할:", result.role);
        console.log("로그인 후 localStorage:", localStorage.getItem("userInfo"));

        // 헤더 상태 업데이트를 위한 이벤트 발생
        if (typeof window !== "undefined") {
          console.log("🔔 authStateChanged 이벤트 발생");
          window.dispatchEvent(new CustomEvent("authStateChanged"));
        }

        if (result.role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/");
        }
      } else {
        console.log("로그인 실패:", result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error("로그인 오류:", err);
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 확인 중 로딩 화면
  if (isCheckingAuth) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-sm text-gray-600">인증 확인 중...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 이메일 로그인 선택 시 폼 렌더링
  if (showEmailLogin) {
    return (
      <Card>
        <CardHeader>
          {/* 뒤로가기 버튼 추가 */}
          <div className="relative flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-0"
              onClick={() => {
                setShowEmailLogin(false);
                setError(""); // 에러 상태 초기화
              }}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-center">이메일로 로그인</CardTitle>
          </div>
          <CardDescription className="text-center">
            계정에 로그인하여 개인 맞춤 뉴스를 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                비밀번호 찾기
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // 처음 로그인 화면 진입 시 선택지 제공
  return (
    <Card>
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>
          계정에 로그인하여 개인 맞춤 뉴스를 확인하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 이메일로 로그인 */}
        <Button
          variant="outline"
          className="w-full h-[50px] text-sm"
          onClick={() => setShowEmailLogin(true)}
        >
          이메일로 로그인
        </Button>
        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">OR</span>
          </div>
        </div>
        {/* 소셜 로그인 */}
        <div className="space-y-3">
          <KakaoLoginButton />
          <GoogleLoginButton />
        </div>
      </CardContent>
    </Card>
  );
}
