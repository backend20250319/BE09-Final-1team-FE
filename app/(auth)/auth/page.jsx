"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import LoginForm from "./_components/LoginForm";
import SignupForm from "./_components/SignupForm";

/**
 * 인증 페이지 컴포넌트 (로그인/회원가입)
 * - 로그인과 회원가입을 탭으로 구분하여 제공
 * - 각 기능을 별도 컴포넌트로 분리하여 관리
 */
export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");

  // 회원가입 성공 시 로그인 탭으로 전환하는 함수
  const switchToLoginTab = () => {
    setActiveTab("login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 페이지 헤더 - 사이트 제목 및 홈 링크 */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            
            <ArrowLeft className="h-4 w-4 mr-2" />
            홈으로 돌아가기
          </Link>
          <h1 className="text-3xl font-logo font-bold text-gray-900">
            NewSphere
          </h1>
          <p className="text-gray-600 mt-2">개인 맞춤 뉴스 서비스</p>
        </div>

        {/* 로그인/회원가입 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">로그인</TabsTrigger>
            <TabsTrigger value="signup">회원가입</TabsTrigger>
          </TabsList>

          {/* 로그인 탭 컨텐츠 */}
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>

          {/* 회원가입 탭 컨텐츠 */}
          <TabsContent value="signup">
            <SignupForm onSignupSuccess={switchToLoginTab} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
