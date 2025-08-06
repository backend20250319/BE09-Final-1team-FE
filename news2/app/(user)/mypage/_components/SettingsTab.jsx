/**
 * 설정 탭 컴포넌트
 * - 뉴스레터 설정 (구독, 발송 시간, 빈도)
 * - 알림 설정 (브라우저 알림, 속보 알림)
 * - 계정 관리 (데이터 내보내기, 약관, 회원 탈퇴)
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Mail, Bell, Settings } from "lucide-react";

export default function SettingsTab() {
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="space-y-6">
      {/* 뉴스레터 설정 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            뉴스레터 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 뉴스레터 구독 토글 */}
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

          {/* 뉴스레터 구독 시 추가 설정 */}
          {newsletterEnabled && (
            <div className="ml-4 space-y-3 border-l-2 border-blue-200 pl-4">
              <div>
                <Label htmlFor="newsletter-time">발송 시간</Label>
                <Input
                  id="newsletter-time"
                  type="time"
                  defaultValue="07:00"
                  className="w-32"
                />
              </div>
              <div>
                <Label>발송 빈도</Label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="frequency"
                      value="daily"
                      defaultChecked
                      className="mr-2"
                    />
                    매일
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="frequency"
                      value="weekly"
                      className="mr-2"
                    />
                    주간
                  </label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
            <Button variant="destructive" className="w-full">
              회원 탈퇴
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
