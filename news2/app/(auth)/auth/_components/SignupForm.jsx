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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, User, Heart, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function SignupForm({ onSignupSuccess }) {
  const router = useRouter();

  // --- 상태 관리 ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState(""); // "MALE" | "FEMALE"
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [newsletter, setNewsletter] = useState(false);
  const [terms, setTerms] = useState(false);

  // UI 및 데이터 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInterests, setIsLoadingInterests] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [interests, setInterests] = useState([]);
  

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setIsLoadingInterests(true);
        const res = await fetch("/api/users/categories");
        if (!res.ok) throw new Error("failed");
        const json = await res.json();
        setInterests(json.data);
      } catch {
        // 폴백: 하드코드 목록
        setInterests([
          { id: "politics", icon: "🏛️", categoryName: "정치" },
          { id: "economy", icon: "💰", categoryName: "경제" },
          { id: "society", icon: "👥", categoryName: "사회" },
          { id: "culture", icon: "🎭", categoryName: "생활" },
          { id: "international", icon: "🌍", categoryName: "세계" },
          { id: "it_science", icon: "💻", categoryName: "IT/과학" },
          { id: "vehicle", icon: "🚗", categoryName: "자동차/교통" },
          { id: "travel_food", icon: "🧳", categoryName: "여행/음식" },
          { id: "art", icon: "🎨", categoryName: "예술" },
        ]);
      } finally {
        setIsLoadingInterests(false);
      }
    };
    fetchInterests();
  }, []);

  // --- 핸들러 ---
  const toggleInterest = (interestId) => {
    const key = String(interestId); // interestId를 문자열로 변환
    setSelectedInterests((prev) => {
      if (prev.includes(key)) {
        return prev.filter((id) => id !== key);
      }
      if (prev.length < 3) {
        return [...prev, key];
      }
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if(!terms) return setError("이용약관에 동의해주세요.");
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

    setIsLoading(true);

    try {
      const interests = selectedInterests.map((id) => {
        const n = Number(id);
        return Number.isNaN(n) ? null : n;
      });

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `회원가입 중 오류가 발생했습니다. (${response.status})`);
      }

      // 2) (선택) 뉴스레터 구독
      if (newsletter && email) {
        try {
          await fetch("/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
        } catch {
          // 구독 실패해도 가입 자체는 성공으로 진행
        }
      }

      setSuccess("회원가입이 완료되었습니다!");
      setTimeout(() => {
        if (newsletter) {
          router.push("/newsletter/dashboard");
        } else if (onSignupSuccess) {
          onSignupSuccess();
        } else {
          router.push("/auth");
        }
      }, 1500);
    } catch (e) {
      setError(e.message || "처리 중 오류가 발생했습니다.");
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
              <RadioGroup value={gender} onValueChange={setGender} className="flex items-center space-x-4 h-10">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MALE" id="male" disabled={isLoading} />
                  <Label htmlFor="male" className="font-normal">남자</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FEMALE" id="female" disabled={isLoading} />
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

        
            {/* 약관 동의 섹션 */}
          <div className="space-y-3 mb-2 mt-2">
                         {/* 뉴스레터 구독 동의 */}
             <div className="flex items-center space-x-2">
               <Checkbox 
                 id="newsletter" 
                 checked={newsletter}
                 onCheckedChange={(v) => setNewsletter(Boolean(v))}
               />
               <Label htmlFor="newsletter" className="text-sm">
                 뉴스레터 구독 (매일 아침 맞춤 뉴스 받기)
               </Label>
             </div>
             
             {/* 이용약관 및 개인정보처리방침 동의 */}
             <div className="flex items-center space-x-2">
               <Checkbox 
                 id="terms" 
                 checked={terms}
                 onCheckedChange={(v) => setTerms(Boolean(v))}
                 required
               />
               <Label htmlFor="terms" className="text-sm">
                 <Link href="/terms" className="text-blue-600 hover:underline">
                   이용약관
                 </Link>{" "}
                 및{" "}
                 <Link href="/privacy" className="text-blue-600 hover:underline">
                   개인정보처리방침
                 </Link>
                 에 동의합니다
               </Label>
             </div>
           </div>
          
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
