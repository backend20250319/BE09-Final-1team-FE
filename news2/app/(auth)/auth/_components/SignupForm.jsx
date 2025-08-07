"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, User, Heart, AlertCircle } from "lucide-react";
import Link from "next/link";

/**
 * 회원가입 폼 컴포넌트
 * - API와 연동하여 실제 회원가입 기능 수행
 * - 환경변수를 통해 API 주소 관리
 */
export default function SignupForm() {
  const router = useRouter();

  // --- 상태 관리 ---
  // 1. 폼 입력 데이터
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [newsletterOk, setNewsletterOk] = useState(false);
  const [termsOk, setTermsOk] = useState(false);

  // 2. UI 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // --- 데이터 ---
  const interests = [
    { id: "POLITICS", label: "정치", icon: "🏛️" },
    { id: "ECONOMY", label: "경제", icon: "💰" },
    { id: "SOCIETY", label: "사회", icon: "👥" },
    { id: "IT_SCIENCE", label: "IT/과학", icon: "💻" },
    { id: "SPORTS", label: "스포츠", icon: "⚽" },
    { id: "CULTURE", label: "문화", icon: "🎭" },
    { id: "INTERNATIONAL", label: "국제", icon: "🌍" },
    { id: "ENTERTAINMENT", label: "연예", icon: "🎬" },
  ];

  // --- 핸들러 ---
  /**
   * 관심사 선택/해제 토글 함수
   */
  const toggleInterest = (interestId) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interestId)) {
        return prev.filter((id) => id !== interestId);
      } else {
        if (prev.length >= 3) return prev;
        return [...prev, interestId];
      }
    });
  };

  /**
   * 회원가입 폼 제출 핸들러
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // --- 유효성 검사 ---
    if (!termsOk) {
      setError("이용약관 및 개인정보처리방침에 동의해야 합니다.");
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      setIsLoading(false);
      return;
    }

    try {
      // 환경변수에서 API 기본 URL 가져오기
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // API 호출
      const response = await fetch(`${apiUrl}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 백엔드에서 요구하는 필드명에 맞춰 전송
        body: JSON.stringify({
          name,
          email,
          password,
          hobbies: selectedInterests,
          letterOk: newsletterOk,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "회원가입 중 오류가 발생했습니다.");
      }

      // 회원가입 성공 시 로그인 페이지로 이동 또는 성공 메시지 표시
      alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
      router.push("/auth");

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
        <CardDescription>
          새 계정을 만들어 개인 맞춤 뉴스 서비스를 시작하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 입력 필드 */}
          <div className="space-y-2">
            <Label htmlFor="signup-name">이름</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="signup-name"
                placeholder="이름을 입력하세요"
                className="pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 이메일 입력 필드 */}
          <div className="space-y-2">
            <Label htmlFor="signup-email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="signup-email"
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

          {/* 비밀번호 입력 필드 */}
          <div className="space-y-2">
            <Label htmlFor="signup-password">비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="signup-password"
                type="password"
                placeholder="8자 이상 입력하세요"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 관심사 선택 섹션 */}
          <div className="space-y-3">
            <Label className="flex items-center justify-between">
              <span className="flex items-center">
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                관심 분야 선택 (선택사항, 최대 3개)
              </span>
              <span className="text-xs text-gray-500">
                {selectedInterests.length}/3
              </span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {interests.map((interest) => {
                const isSelected = selectedInterests.includes(interest.id);
                const isDisabled = !isSelected && selectedInterests.length >= 3;
                return (
                  <div
                    key={interest.id}
                    onClick={() => !isDisabled && toggleInterest(interest.id)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                        : isDisabled
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                        : "border-gray-200 hover:border-gray-400 cursor-pointer"
                    }`}
                  >
                    <div className="text-lg mb-1">{interest.icon}</div>
                    <div className="text-sm font-medium">{interest.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 약관 동의 섹션 */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="newsletter"
                checked={newsletterOk}
                onCheckedChange={setNewsletterOk}
                disabled={isLoading}
              />
              <Label htmlFor="newsletter" className="text-sm font-normal">
                뉴스레터 구독 (매일 아침 맞춤 뉴스 받기)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={termsOk}
                onCheckedChange={setTermsOk}
                disabled={isLoading}
              />
              <Label htmlFor="terms" className="text-sm font-normal">
                <Link href="/terms" className="text-blue-600 hover:underline">
                  이용약관
                </Link>{" "}
                및{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  개인정보처리방침
                </Link>
                에 동의합니다 (필수)
              </Label>
            </div>
          </div>

          {/* 에러 메시지 표시 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 회원가입 버튼 */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "가입 처리 중..." : "회원가입"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}