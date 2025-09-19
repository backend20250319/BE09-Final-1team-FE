"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

function ResetPasswordContent() {
  // --- 상태값 관리 영역 ---
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    letter: false,
    number: false,
    special: false,
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- 컴포넌트 마운트 시 URL에서 토큰 가져오기 ---
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      setError(
        "유효하지 않은 접근입니다. 비밀번호 재설정 이메일을 다시 확인해주세요."
      );
    }
    setToken(tokenFromUrl);
  }, [searchParams]);

  // --- 비밀번호 유효성 검사 ---
  const validatePassword = (pw) => {
    setPasswordCriteria({
      length: pw.length >= 10,
      letter: /[a-zA-Z]/.test(pw),
      number: /\d/.test(pw),
      special: /[@$!%*?&]/.test(pw),
    });
  };

  const handlePasswordChange = (e) => {
    const newPw = e.target.value;
    setNewPassword(newPw);
    validatePassword(newPw);
  };

  // 기존 validatePassword 함수는 제거하고 위의 로직으로 대체

  // --- 폼 제출 핸들러 (백엔드 API 연동) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 토큰 존재 여부 확인
    if (!token) {
      setError("유효하지 않은 재설정 토큰입니다.");
      setIsLoading(false);
      return;
    }

    // 비밀번호 유효성 검사
    const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);
    if (!allCriteriaMet) {
      setError("비밀번호 조건을 모두 만족해야 합니다.");
      setIsLoading(false);
      return;
    }

    // 비밀번호 확인 검사
    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    try {
      // 환경변수에서 API 기본 URL 가져오기
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // API 호출
      const response = await fetch(`${apiUrl}/api/auth/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 백엔드에서 요구하는 필드명(token, newPassword, confirmPassword)에 맞춰 전송
        body: JSON.stringify({
          token: token,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // 서버에서 보낸 에러 메시지가 있다면 사용, 없다면 기본 메시지
        throw new Error(
          result.message || "비밀번호 재설정 중 오류가 발생했습니다."
        );
      }

      // 재설정 성공 처리
      setIsSubmitted(true);
    } catch (error) {
      setError(
        error.message || "네트워크 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- 로그인 페이지로 이동 ---
  const handleGoToLogin = () => {
    router.push("/auth");
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
          <h1 className="text-3xl font-bold font-logo text-gray-900">
            NewSphere
          </h1>
          <p className="text-gray-600 mt-2">개인 맞춤 뉴스 서비스</p>
        </div>

        {/* 카드 영역: 폼 or 성공 메시지 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isSubmitted ? "비밀번호 재설정 완료" : "새 비밀번호 설정"}
            </CardTitle>
            <CardDescription>
              {isSubmitted
                ? "비밀번호가 성공적으로 변경되었습니다."
                : "새로운 비밀번호를 입력해주세요."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* (1) 재설정 전: 비밀번호 입력 폼 */}
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 새 비밀번호 입력 */}
                <div className="space-y-2">
                  <Label htmlFor="new-password">새 비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="영문자, 숫자, 특수문자 포함 10자 이상"
                      className="pl-10 pr-10"
                      value={newPassword}
                      onChange={handlePasswordChange}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {/* 실시간 비밀번호 조건 안내 UI */}
                  {newPassword.length > 0 && (
                    <ul className="text-xs space-y-1 mt-2 p-2 rounded-md bg-gray-50 text-gray-600">
                      <li
                        className={
                          passwordCriteria.length
                            ? "text-green-600"
                            : "text-red-500"
                        }
                      >
                        {passwordCriteria.length ? "✓" : "✗"} 10자 이상
                      </li>
                      <li
                        className={
                          passwordCriteria.letter
                            ? "text-green-600"
                            : "text-red-500"
                        }
                      >
                        {passwordCriteria.letter ? "✓" : "✗"} 영문자 포함
                      </li>
                      <li
                        className={
                          passwordCriteria.number
                            ? "text-green-600"
                            : "text-red-500"
                        }
                      >
                        {passwordCriteria.number ? "✓" : "✗"} 숫자 포함
                      </li>
                      <li
                        className={
                          passwordCriteria.special
                            ? "text-green-600"
                            : "text-red-500"
                        }
                      >
                        {passwordCriteria.special ? "✓" : "✗"} 특수문자(@$!%*?&)
                        포함
                      </li>
                    </ul>
                  )}
                </div>

                {/* 비밀번호 확인 입력 */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">비밀번호 확인</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="비밀번호를 다시 입력하세요"
                      className="pl-10 pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* 비밀번호 요구사항 안내 */}
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium">비밀번호 요구사항:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>최소 10자 이상</li>
                    <li>영문자 포함 (대소문자 구분 없음)</li>
                    <li>숫자 포함</li>
                    <li>특수문자(@$!%*?&) 포함</li>
                  </ul>
                </div>

                {/* 오류 메시지 영역 */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* 제출 버튼 */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !token}
                >
                  {isLoading ? "재설정 중..." : "비밀번호 재설정"}
                </Button>
              </form>
            ) : (
              // (2) 재설정 완료: 성공 메시지 및 로그인 버튼
              <div className="space-y-4">
                {/* 성공 메시지 */}
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    비밀번호가 성공적으로 재설정되었습니다.
                  </AlertDescription>
                </Alert>

                {/* 안내 메시지 */}
                <div className="text-sm text-gray-600 text-center">
                  <p>이제 새로운 비밀번호로 로그인할 수 있습니다.</p>
                </div>

                {/* 로그인 페이지로 이동 버튼 */}
                <Button onClick={handleGoToLogin} className="w-full">
                  로그인하러 가기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 하단 보안 안내 */}
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500">
            <p>보안을 위해 정기적으로 비밀번호를 변경해주세요.</p>
            <p>타인과 비밀번호를 공유하지 마세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md space-y-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
