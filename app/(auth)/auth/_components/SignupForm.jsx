"use client";

import { useState, useEffect } from "react";
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
import {
  SignupRequestSchema,
  SignupResponseSchema,
  NewsletterSubscriptionSchema,
  NewsletterSubscriptionResponseSchema,
  AdditionalInfoRequestSchema,
} from "@/lib/utils/schemas";
import { getDeviceId } from "@/lib/auth/auth";
import { useInterests } from "@/lib/hooks/useInterests";

export default function SignupForm({ mode = "signup", onSignupSuccess }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- 상태 관리 ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    letter: false,
    number: false,
    special: false,
  });
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState(""); // "MALE" | "FEMALE"
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [newsletter, setNewsletter] = useState(false);
  const [terms, setTerms] = useState(false);

  // UI 및 데이터 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 관심사 데이터 (커스텀 훅 사용)
  const {
    interests,
    isLoading: isLoadingInterests,
    error: interestsError,
  } = useInterests();

  // 비밀번호 유효성 검사 로직
  const validatePassword = (pw) => {
    setPasswordCriteria({
      length: pw.length >= 10,
      letter: /[a-zA-Z]/.test(pw),
      number: /\d/.test(pw),
      special: /[@$!%*?&]/.test(pw),
    });
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  // --- 핸들러 ---
  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  };

  useEffect(() => {
    // 쿠키 기반 인증에서는 URL 토큰 검증이 불필요합니다.
    // 백엔드에서 이미 httpOnly 쿠키로 인증 상태를 관리합니다.
  }, [mode, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!terms) return setError("이용약관에 동의해주세요.");
    // birthYear와 gender 필드가 비어있는지 확인
    if (!birthYear || !gender) {
      setError("출생연도와 성별을 모두 선택해주세요.");
      setIsLoading(false);
      return;
    }
    // 일반 회원가입일 때만 비밀번호 검증
    if (mode === "signup") {
      const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);
      if (!allCriteriaMet) {
        setError("비밀번호 조건을 모두 만족해야 합니다.");
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);

    try {
      let requestBody;
      let apiEndpoint;

      // deviceId 가져오기 (공통)
      const deviceId = getDeviceId();
      if (!deviceId) {
        setError("디바이스 ID 생성에 실패했습니다.");
        setIsLoading(false);
        return;
      }

      if (mode === "signup") {
        // --- 기존 회원가입 로직 ---
        apiEndpoint = "/api/users/signup";
        requestBody = {
          name,
          email,
          password,
          birthYear: parseInt(birthYear, 10),
          gender,
          hobbies: selectedInterests,
          deviceId, // deviceId 추가
        };

        // zod 스키마로 요청 데이터 검증
        try {
          SignupRequestSchema.parse(requestBody);
          console.log("✅ 회원가입 요청 데이터:", requestBody);
        } catch (validationError) {
          console.error("스키마 검증 에러:", validationError);
          const errorMessage =
            validationError.errors?.[0]?.message ||
            "입력 데이터 형식이 올바르지 않습니다";
          setError(errorMessage);
          setIsLoading(false);
          return;
        }
      } else {
        // --- 소셜 로그인 추가 정보 전송 로직 ---
        apiEndpoint = "/api/auth/oauth2/additional-info";
        requestBody = {
          birthYear: parseInt(birthYear, 10),
          gender,
          hobbies: selectedInterests,
          deviceId, // deviceId 추가
        };

        // 새로운 Zod 스키마로 검증
        try {
          AdditionalInfoRequestSchema.parse(requestBody);
          console.log("✅ 추가 정보 요청 데이터:", requestBody);
        } catch (validationError) {
          console.error("추가 정보 스키마 검증 에러:", validationError);
          const errorMessage =
            validationError.errors?.[0]?.message ||
            "입력 데이터 형식이 올바르지 않습니다";
          setError(errorMessage);
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 쿠키 기반 인증: httpOnly 쿠키를 받기 위해 credentials 포함
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API 요청 에러:", errorData);
        throw new Error(
          errorData.message ||
            errorData.error ||
            `요청 중 오류가 발생했습니다. (${response.status})`
        );
      }

      const responseData = await response.json();

      if (mode === "social") {
        // 쿠키 기반 인증: 백엔드에서 httpOnly 쿠키를 설정하므로
        // 클라이언트에서는 사용자 정보만 저장합니다.
        const userData = responseData.data?.user || responseData.user;
        if (userData) {
          const { setUserInfo } = await import("@/lib/auth");
          setUserInfo(userData);

          console.log("🔐 소셜 로그인 추가 정보 입력 완료:", {
            userId: userData.id,
            email: userData.email,
            role: userData.role,
          });

          setSuccess("정보 입력이 완료되었습니다! 메인 페이지로 이동합니다.");
          setTimeout(() => router.push("/"), 1500);
        } else {
          throw new Error("사용자 정보를 받지 못했습니다.");
        }
      } else {
        // 기존 회원가입 성공 로직
        // 쿠키 기반 인증: 백엔드에서 자동 로그인 처리하고 쿠키 설정
        const userData = responseData.data?.user || responseData.user;
        if (userData) {
          const { setUserInfo } = await import("@/lib/auth");
          setUserInfo(userData);

          console.log("🔐 회원가입 후 자동 로그인 완료:", {
            userId: userData.id,
            email: userData.email,
            role: userData.role,
          });
        }

        // 응답 스키마 검증 (선택사항)
        try {
          SignupResponseSchema.parse(responseData);
        } catch (validationError) {
          console.warn("회원가입 응답 스키마 불일치:", validationError);
          // 응답 검증 실패해도 성공으로 처리 (선택사항)
        }

        // 뉴스레터 구독 로직
        if (newsletter && email) {
          try {
            // 뉴스레터 구독 요청 데이터 검증
            const subscriptionData = { email };
            try {
              NewsletterSubscriptionSchema.parse(subscriptionData);
            } catch (validationError) {
              console.warn(
                "뉴스레터 구독 요청 데이터 검증 실패:",
                validationError
              );
              // 검증 실패해도 구독 시도는 계속
            }

            const subscriptionResponse = await fetch("/api/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include", // 인증된 사용자의 뉴스레터 구독을 위해 쿠키 포함
              body: JSON.stringify(subscriptionData),
            });

            if (subscriptionResponse.ok) {
              // 응답 스키마 검증 (선택사항)
              try {
                const subscriptionResponseData = await subscriptionResponse
                  .json()
                  .catch(() => ({}));
                NewsletterSubscriptionResponseSchema.parse(
                  subscriptionResponseData
                );
              } catch (validationError) {
                console.warn(
                  "뉴스레터 구독 응답 스키마 불일치:",
                  validationError
                );
              }
            }
          } catch {
            // 구독 실패해도 가입 자체는 성공으로 진행
          }
        }

        setSuccess("회원가입이 완료되었습니다! 로그인 화면으로 이동합니다.");
        setTimeout(() => {
          if (onSignupSuccess) {
            onSignupSuccess();
          } else {
            router.push("/auth");
          }
        }, 1500);
      }
    } catch (e) {
      setError(e.message || "처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 출생연도 목록 생성
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1924 },
    (_, i) => currentYear - i
  );

  return (
    <Card>
      <CardHeader>
        {/* 모드에 따라 제목 변경 */}
        <CardTitle>
          {mode === "signup" ? "회원가입" : "추가 정보 입력"}
        </CardTitle>
        <CardDescription>
          {mode === "signup"
            ? "새 계정을 만들어 개인 맞춤 뉴스 서비스를 시작하세요"
            : "정확한 뉴스 추천을 위해 추가 정보를 입력해주세요."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* mode가 'signup'일 때만 이름, 이메일, 비밀번호 필드를 보여줍니다. */}
          {mode === "signup" && (
            <>
              {/* 이름, 이메일, 비밀번호 필드 */}
              <div className="space-y-2">
                <Label htmlFor="signup-name">이름</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
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
              <div className="space-y-2">
                <Label htmlFor="signup-email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
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
              <div className="space-y-2">
                <Label htmlFor="signup-password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="영문자, 숫자, 특수문자 포함 10자 이상"
                    className="pl-10"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                {/* 실시간 비밀번호 조건 안내 UI */}
                {password.length > 0 && (
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
            </>
          )}

          {/* 출생연도 및 성별 선택 (가로 배치) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birth-year">출생연도</Label>
              <Select
                onValueChange={setBirthYear}
                value={birthYear}
                disabled={isLoading}
              >
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
                value={gender}
                onValueChange={setGender}
                className="flex items-center space-x-4 h-10"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MALE" id="male" disabled={isLoading} />
                  <Label htmlFor="male" className="font-normal">
                    남자
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="FEMALE"
                    id="female"
                    disabled={isLoading}
                  />
                  <Label htmlFor="female" className="font-normal">
                    여자
                  </Label>
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
              <span className="text-xs text-gray-500">
                {selectedInterests.length}/3
              </span>
            </Label>
            {isLoadingInterests ? (
              <div className="text-center p-4 text-gray-500">
                관심사 목록을 불러오는 중...
              </div>
            ) : interestsError ? (
              <div className="text-center p-4">
                <div className="text-orange-600 text-sm mb-2">
                  ⚠️ API 연결 실패: 기본 목록을 사용합니다
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {interests.map((interest) => {
                    const isSelected = selectedInterests.includes(interest.categoryCode);
                    const isDisabled =
                      !isSelected && selectedInterests.length >= 3;
                    return (
                      <div
                        key={interest.categoryCode}
                        onClick={() =>
                          !isDisabled && toggleInterest(interest.categoryCode)
                        }
                        className={`p-3 rounded-lg border text-center transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                            : isDisabled
                            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                            : "border-gray-200 hover:border-gray-400 cursor-pointer"
                        }`}
                      >
                        <div className="text-lg mb-1">{interest.icon}</div>
                        <div className="text-sm font-medium">
                          {interest.categoryName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {interests.map((interest) => {
                  const isSelected = selectedInterests.includes(interest.categoryCode);
                  const isDisabled =
                    !isSelected && selectedInterests.length >= 3;
                  return (
                    <div
                      key={interest.categoryCode}
                      onClick={() => !isDisabled && toggleInterest(interest.categoryCode)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                          : isDisabled
                          ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                          : "border-gray-200 hover:border-gray-400 cursor-pointer"
                      }`}
                    >
                      <div className="text-lg mb-1">{interest.icon}</div>
                      <div className="text-sm font-medium">
                        {interest.categoryName}
                      </div>
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
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isLoadingInterests || !!success}
          >
            {isLoading
              ? "처리 중..."
              : success
              ? "완료!"
              : mode === "signup"
              ? "회원가입"
              : "가입 완료"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
