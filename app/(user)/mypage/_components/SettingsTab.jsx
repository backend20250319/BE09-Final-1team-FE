/**
 * 설정 탭 컴포넌트
 * - 뉴스레터 설정 (구독, 발송 시간, 빈도)
 * - 알림 설정 (브라우저 알림, 속보 알림)
 * - 계정 관리 (데이터 내보내기, 약관, 회원 탈퇴)
 */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Bell, Settings, AlertCircle } from "lucide-react";
import { authenticatedFetch } from "@/lib/auth/auth";

export default function SettingsTab() {
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // 회원 탈퇴 관련 상태
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 회원 탈퇴 처리  함수
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setDeleteError("");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await authenticatedFetch(`${apiUrl}/api/users/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response && response.ok) {
        const data = await response.json();
        if (data.success) {
          // 탈퇴 성공 시 로컬 스토리지 정리 및 로그인 페이지로 리다이렉트
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          alert("회원 탈퇴가 완료되었습니다.");
          window.location.href = "/auth";
        } else {
          throw new Error(data.message || "회원 탈퇴에 실패했습니다.");
        }
      } else {
        throw new Error("회원 탈퇴 요청에 실패했습니다.");
      }
    } catch (err) {
      console.error("회원 탈퇴 오류:", err);
      setDeleteError(err.message || "회원 탈퇴 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
      setShowConfirmDialog(false);
    }
  };

  // 회원 탈퇴 확인 다이얼로그
  const confirmDeleteAccount = () => {
    const isConfirmed = window.confirm(
      "정말로 회원 탈퇴를 하시겠습니까?\n\n탈퇴 시 모든 데이터가 삭제되며, 이는 되돌릴 수 없습니다."
    );

    if (isConfirmed) {
      handleDeleteAccount();
    }
  };

  return (
    <div className="space-y-6">
      {/* 알림 설정 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            알림 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 브라우저 알림 설정 */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">브라우저 알림</Label>
              <p className="text-sm text-gray-600">
                중요한 뉴스가 있을 때 알림을 받습니다
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          {/* 속보 알림 설정 */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="breaking-news">속보 알림</Label>
              <p className="text-sm text-gray-600">
                속보 뉴스를 즉시 알림으로 받습니다
              </p>
            </div>
            <Switch id="breaking-news" />
          </div>
        </CardContent>
      </Card>

      {/* 계정 관리 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            계정 관리
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* 회원 탈퇴 에러 메시지 */}
            {deleteError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{deleteError}</AlertDescription>
              </Alert>
            )}

            {/* 계정 관리 메뉴 버튼들 */}
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              데이터 내보내기
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              개인정보 처리방침
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              이용약관
            </Button>
            <Separator />
            {/* 회원 탈퇴 버튼 */}
            <Button
              variant="destructive"
              className="w-full"
              onClick={confirmDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? "탈퇴 처리 중..." : "회원 탈퇴"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
