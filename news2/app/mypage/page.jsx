/**
 * 마이페이지 메인 컴포넌트
 * - 사용자 프로필 및 설정 관리
 * - 탭 기반 인터페이스로 구성
 * - 각 기능별 컴포넌트로 분리하여 관리
 */
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/header";

// 분리된 컴포넌트들 import
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileTab from "./components/ProfileTab";
import InterestsTab from "./components/InterestsTab";
import ScrapsTab from "./components/ScrapsTab";
import HistoryTab from "./components/HistoryTab";
import SettingsTab from "./components/SettingsTab";

export default function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 프로필 사이드바 */}
          <div className="lg:col-span-1">
            <ProfileSidebar />
          </div>

          {/* 메인 콘텐츠 영역 */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              {/* 탭 메뉴 */}
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile">프로필</TabsTrigger>
                <TabsTrigger value="interests">관심사</TabsTrigger>
                <TabsTrigger value="scraps">스크랩</TabsTrigger>
                <TabsTrigger value="history">읽기 기록</TabsTrigger>
                <TabsTrigger value="settings">설정</TabsTrigger>
              </TabsList>

              {/* 각 탭별 컨텐츠 */}
              <TabsContent value="profile">
                <ProfileTab />
              </TabsContent>

              <TabsContent value="interests">
                <InterestsTab />
              </TabsContent>

              <TabsContent value="scraps">
                <ScrapsTab />
              </TabsContent>

              <TabsContent value="history">
                <HistoryTab />
              </TabsContent>

              <TabsContent value="settings">
                <SettingsTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
