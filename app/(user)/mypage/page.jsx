"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { isAuthenticated } from "@/lib/auth/auth";

import ProfileSidebar from "./_components/ProfileSidebar";
import ProfileTab from "./_components/ProfileTab";
import ScrapsTab from "./_components/ScrapsTab";
import HistoryTab from "./_components/HistoryTab";
import SettingsTab from "./_components/SettingsTab";
import CollectionsTab from "./_components/CollectionsTab";
import { MypageProvider } from "@/contexts/MypageContext";

function MyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        console.log("❌ 인증되지 않은 사용자, 로그인 페이지로 리다이렉트");
        router.replace("/auth");
        return;
      }
      setIsAuthChecking(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
        tab &&
        ["profile", "scraps", "collections", "history", "settings"].includes(tab)
    ) {
      setActiveTab(tab);
    } else if (tab) {
      router.replace("/mypage", undefined, { shallow: true });
    }
  }, [searchParams, router]);

  if (isAuthChecking) {
    return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <MypageProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <ProfileSidebar />
              </div>

              <div className="lg:col-span-3">
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                    <TabsTrigger value="profile">프로필</TabsTrigger>
                    <TabsTrigger value="scraps">스크랩</TabsTrigger>
                    <TabsTrigger value="collections">컬렉션</TabsTrigger>
                    <TabsTrigger value="history">읽기 기록</TabsTrigger>
                    <TabsTrigger value="settings">설정</TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile">
                    <ProfileTab />
                  </TabsContent>

                  <TabsContent value="scraps">
                    <ScrapsTab />
                  </TabsContent>

                  <TabsContent value="collections">
                    <CollectionsTab />
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
      </MypageProvider>
  );
}

export default function MyPage() {
  return (
      <Suspense
          fallback={
            <div className="min-h-screen bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          }
      >
        <MyPageContent />
      </Suspense>
  );
}
