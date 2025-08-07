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

export default function ProfileTab() {
  // --- 상태 관리 ---
  const [interests, setInterests] = useState([]); // 전체 관심사 목록
  const [selectedInterests, setSelectedInterests] = useState([]); // 사용자가 선택한 관심사
  const [newsletterEnabled, setNewsletterEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- UI 상태 관리 ---
  const [isLoading, setIsLoading] = useState(true); // 초기 데이터 로딩
  const [isUpdating, setIsUpdating] = useState(false); // 업데이트 진행
  const [error, setError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  // --- 데이터 로딩 ---
  useEffect(() => {
    // 페이지가 로드될 때 모든 데이터를 한 번에 가져옵니다.
    const loadInitialData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        // 1. 전체 관심사 목록 가져오기
        const interestsResponse = await fetch(`${apiUrl}/api/users/categories`);
        if (!interestsResponse.ok) throw new Error("관심사 목록 로딩 실패");
        const interestsData = await interestsResponse.json();
        setInterests(interestsData.data);

        // 2. 사용자 정보 가져오기
        const userResponse = await authenticatedFetch(
          `${apiUrl}/api/users/mypage`
        );
        if (!userResponse || !userResponse.ok)
          throw new Error("사용자 정보 로딩 실패");
        const userData = await userResponse.json();

        // 3. 받아온 데이터로 상태 설정
        if (userData.success) {
          // 사용자의 취미 목록(hobbies)을 selectedInterests 상태에 직접 설정
          setSelectedInterests(userData.data.hobbies || []);
          setNewsletterEnabled(userData.data.letterOk || false);
        } else {
          throw new Error(userData.message || "사용자 정보 로딩 실패");
        }
      } catch (err) {
        console.error("데이터 로드 오류:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

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
        if (newPassword.length < 8) {
          throw new Error("새 비밀번호는 최소 8자 이상이어야 합니다.");
        }
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
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

      const response = await authenticatedFetch(
        `${apiUrl}/api/users/myupdate`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

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
          {/* 초기 데이터 로딩 에러만 표시 */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="text-center p-8 text-gray-500">
              정보를 불러오는 중...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {interests.map((interest) => {
                  const isSelected = selectedInterests.includes(interest.id);
                  const isDisabled =
                    !isSelected && selectedInterests.length >= 3;
                  return (
                    <div
                      key={interest.id}
                      onClick={() => !isDisabled && toggleInterest(interest.id)}
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
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 (8자 이상)"
            />
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
