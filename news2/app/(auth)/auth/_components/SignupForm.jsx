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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // RadioGroup import
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, User, Heart, AlertCircle } from "lucide-react";

export default function SignupForm({ onSignupSuccess }) {
  const router = useRouter();

  // --- 상태 관리 ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState(""); // 성별 상태 추가
  const [selectedInterests, setSelectedInterests] = useState([]);
  // const [termsOk, setTermsOk] = useState(false);

  // UI 및 데이터 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [interests, setInterests] = useState([]);
  const [isLoadingInterests, setIsLoadingInterests] = useState(true);

  // --- 데이터 로딩 ---
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setIsLoadingInterests(true);
        const response = await fetch('/api/users/categories');
        if (!response.ok) {
          throw new Error("관심사 목록을 불러오는데 실패했습니다.");
        }
        const responseData = await response.json();
        setInterests(responseData.data);
      } catch (err) {
        console.error(err);
        setError("관심사 목록을 불러올 수 없습니다. 페이지를 새로고침 해주세요.");
      } finally {
        setIsLoadingInterests(false);
      }
    };
    fetchInterests();
  }, []);

  // --- 핸들러 ---
  const toggleInterest = (interestId) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interestId)) {
        return prev.filter((id) => id !== interestId);
      }
      if (prev.length < 3) {
        return [...prev, interestId];
      }
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // birthYear와 gender 필드가 비어있는지 확인
    if (!birthYear || !gender) {
      setError("출생연도와 성별을 모두 선택해주세요.");
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users/signup', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          birthYear: parseInt(birthYear, 10), // 숫자로 변환하여 전송
          gender, // 성별 추가
          hobbies: selectedInterests,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "회원가입 중 오류가 발생했습니다.");
      }

      setSuccess("회원가입이 완료되었습니다! 잠시 후 로그인 탭으로 이동합니다.");
      setTimeout(() => {
        if (onSignupSuccess) {
          onSignupSuccess();
        }
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 출생연도 목록 생성
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1924 }, (_, i) => currentYear - i);

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
          {/* 이름, 이메일, 비밀번호 필드 */}
          <div className="space-y-2">
            <Label htmlFor="signup-name">이름</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input id="signup-name" placeholder="이름을 입력하세요" className="pl-10" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input id="signup-email" type="email" placeholder="이메일을 입력하세요" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input id="signup-password" type="password" placeholder="8자 이상 입력하세요" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
            </div>
          </div>

          {/* 출생연도 및 성별 선택 (가로 배치) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birth-year">출생연도</Label>
              <Select onValueChange={setBirthYear} value={birthYear} disabled={isLoading}>
                <SelectTrigger id="birth-year">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}년
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>성별</Label>
              <RadioGroup
                defaultValue={gender}
                onValueChange={setGender}
                className="flex items-center space-x-4 h-10"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MALE" id="male" />
                  <Label htmlFor="male" className="font-normal">남자</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FEMALE" id="female" />
                  <Label htmlFor="female" className="font-normal">여자</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* 관심사 선택 섹션 */}
          <div className="space-y-3">
            <Label className="flex items-center justify-between">
              <span className="flex items-center">
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                관심 분야 선택 (선택사항, 최대 3개)
              </span>
              <span className="text-xs text-gray-500">{selectedInterests.length}/3</span>
            </Label>
            {isLoadingInterests ? (
              <div className="text-center p-4 text-gray-500">관심사 목록을 불러오는 중...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                      <div className="text-sm font-medium">{interest.categoryName}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 약관 동의, 에러/성공 메시지, 회원가입 버튼 */}
          {/* ... (기존 코드와 동일) ... */}
          
          {/* 에러 및 성공 메시지 표시 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || isLoadingInterests || !!success}>
            {isLoading ? "가입 처리 중..." : success ? "가입 완료!" : "회원가입"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
