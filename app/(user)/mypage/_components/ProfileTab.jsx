"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Shield, AlertCircle, Mail } from "lucide-react";
import { authenticatedFetch } from "@/lib/auth";
import { useInterests } from "@/hooks/useInterests";

export default function ProfileTab() {
  // --- 상태 관리 ---
  const [selectedInterests, setSelectedInterests] = useState([]); // 사용자가 선택한 관심사
  const [newsletterEnabled, setNewsletterEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    letter: false,
    number: false,
    special: false,
  });

  // 관심사 데이터 (커스텀 훅 사용)
  const {
    interests,
    isLoading: isLoadingInterests,
    error: interestsError,
  } = useInterests();

  // --- UI 상태 관리 ---
  const [isLoading, setIsLoading] = useState(true); // 사용자 데이터 로딩
  const [isUpdating, setIsUpdating] = useState(false); // 업데이트 진행
  const [error, setError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  // --- 데이터 로딩 ---
  useEffect(() => {
    // 사용자 정보만 가져옵니다 (관심사 목록은 useInterests 훅에서 처리)
    const loadUserData = async () => {
      setIsLoading(true);
      setError("");
      try {
        // ✅ Next.js API route를 통해 사용자 정보 가져오기 (쿠키 기반 인증)
        const userResponse = await authenticatedFetch("/api/users/mypage");

        if (!userResponse || !userResponse.ok)
          throw new Error("사용자 정보 로딩 실패");

        const userData = await userResponse.json();
        console.log("🔍 ProfileTab: API 응답 데이터:", userData);

        // 받아온 데이터로 상태 설정
        if (userData.success) {
          // 사용자의 취미 목록(hobbies)을 selectedInterests 상태에 직접 설정
          setSelectedInterests(userData.data.hobbies || []);
          setNewsletterEnabled(userData.data.letterOk || false);
          console.log("✅ ProfileTab: 사용자 데이터 로드 완료:", {
            hobbies: userData.data.hobbies,
            letterOk: userData.data.letterOk,
          });
        } else {
          throw new Error(userData.message || "사용자 정보 로딩 실패");
        }
      } catch (err) {
        console.error("ProfileTab 사용자 데이터 로드 오류:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // --- 핸들러 ---
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
    const newPw = e.target.value;
    setNewPassword(newPw);
    validatePassword(newPw);
  };

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

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");

    try {
      const hasPasswordChange =
        currentPassword && newPassword && confirmPassword;

      if (hasPasswordChange) {
        if (newPassword !== confirmPassword) {
          throw new Error("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        }
        // 강화된 비밀번호 검증
        const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);
        if (!allCriteriaMet) {
          throw new Error("비밀번호 조건을 모두 만족해야 합니다.");
        }
      }

      const requestBody = {
        letterOk: newsletterEnabled,
        hobbies: selectedInterests, // ✨ 수정된 부분: selectedInterests를 그대로 사용
      };

      if (hasPasswordChange) {
        requestBody.currentpassword = currentPassword;
        requestBody.newPassword = newPassword;
        // 백엔드 API 명세에 따라 필드명 확인 필요
        // requestBody.confirmPassword = confirmPassword;
      }

      const response = await authenticatedFetch("/api/users/myupdate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response && response.ok && data.success) {
        setUpdateSuccess("프로필이 성공적으로 변경되었습니다.");
        if (hasPasswordChange) {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }
      } else {
        throw new Error(data.message || "프로필 변경에 실패했습니다.");
      }
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 관심 분야 설정 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              관심 분야 설정
            </span>
            <span className="text-sm text-gray-500 font-normal">
              {selectedInterests.length}/3
            </span>
          </CardTitle>
          <CardDescription>
            관심 있는 분야를 선택하면 맞춤 뉴스를 제공받을 수 있습니다 (최대
            3개)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 초기 사용자 데이터 로딩 에러만 표시 */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 관심사 목록 에러 표시 */}
          {interestsError && (
            <Alert className="mb-4 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                ⚠️ 관심사 목록 로딩 실패: 기본 목록을 사용합니다
              </AlertDescription>
            </Alert>
          )}

          {isLoading || isLoadingInterests ? (
            <div className="text-center p-8 text-gray-500">
              {isLoading
                ? "사용자 정보를 불러오는 중..."
                : "관심사 목록을 불러오는 중..."}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {interests.map((interest) => {
                  const isSelected = selectedInterests.includes(interest.categoryCode);
                  const isDisabled =
                    !isSelected && selectedInterests.length >= 3;
                  return (
                    <div
                      key={interest.categoryCode}
                      onClick={() => !isDisabled && toggleInterest(interest.categoryCode)}
                      className={`p-4 rounded-lg border transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300 cursor-pointer"
                          : isDisabled
                          ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                          : "border-gray-200 hover:border-gray-400 cursor-pointer"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{interest.icon}</div>
                        <div className="text-base font-medium">
                          {interest.categoryName}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 뉴스레터 및 보안    설정 카드 ... */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            뉴스레터 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="newsletter">뉴스레터 구독</Label>
              <p className="text-sm text-gray-600">
                매일 아침 맞춤 뉴스를 이메일로 받아보세요
              </p>
            </div>
            <Switch
              id="newsletter"
              checked={newsletterEnabled}
              onCheckedChange={setNewsletterEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            비밀번호 변경 (선택사항)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password">현재 비밀번호</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="비밀번호를 변경하려면 입력하세요"
            />
          </div>
          <div>
            <Label htmlFor="new-password">새 비밀번호</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={handlePasswordChange}
              placeholder="영문자, 숫자, 특수문자 포함 10자 이상"
            />
            {/* 실시간 비밀번호 조건 안내 UI */}
            {newPassword.length > 0 && (
              <ul className="text-xs space-y-1 mt-2 p-2 rounded-md bg-gray-50 text-gray-600">
                <li
                  key="length"
                  className={
                    passwordCriteria.length ? "text-green-600" : "text-red-500"
                  }
                >
                  {passwordCriteria.length ? "✓" : "✗"} 10자 이상
                </li>
                <li
                  key="letter"
                  className={
                    passwordCriteria.letter ? "text-green-600" : "text-red-500"
                  }
                >
                  {passwordCriteria.letter ? "✓" : "✗"} 영문자 포함
                </li>
                <li
                  key="number"
                  className={
                    passwordCriteria.number ? "text-green-600" : "text-red-500"
                  }
                >
                  {passwordCriteria.number ? "✓" : "✗"} 숫자 포함
                </li>
                <li
                  key="special"
                  className={
                    passwordCriteria.special ? "text-green-600" : "text-red-500"
                  }
                >
                  {passwordCriteria.special ? "✓" : "✗"} 특수문자(@$!%*?&) 포함
                </li>
              </ul>
            )}
          </div>
          <div>
            <Label htmlFor="confirm-password">비밀번호 확인</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호 다시 입력"
            />
          </div>
        </CardContent>
      </Card>

      {/* 프로필 변경 버튼과 결과 메시지 */}
      <div className="space-y-4">
        {/* 업데이트 결과 메시지 */}
        {updateError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{updateError}</AlertDescription>
          </Alert>
        )}

        {updateSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {updateSuccess}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleUpdateProfile}
            disabled={isUpdating || isLoading}
          >
            {isUpdating ? "변경 중..." : "프로필 변경사항 저장"}
          </Button>
        </div>
      </div>
    </div>
  );
}
