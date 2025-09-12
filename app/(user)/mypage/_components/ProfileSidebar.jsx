"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authenticatedFetch } from "@/lib/auth/auth";
import { useMypageContext } from "@/contexts/MypageContext";
import { useScrap } from "@/contexts/ScrapContext";

/**
 * 프로필 사이드바 컴포넌트
 * - API를 통해 사용자 정보를 동적으로 로드하여 표시
 * - ScrapContext에서 스크랩 개수를 가져와 표시
 */
export default function ProfileSidebar() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { readArticleCount } = useMypageContext();
  const { totalScraps } = useScrap();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // ✅ Next.js API route를 통해 사용자 정보 가져오기 (쿠키 기반 인증)
        const response = await authenticatedFetch("/api/users/mypage");

        if (!response || !response.ok) {
          throw new Error("사용자 정보를 불러올 수 없습니다.");
        }

        const data = await response.json().catch(() => ({}));
        console.log("🔍 ProfileSidebar: API 응답 데이터:", data);

        if (data.success) {
          setUserData(data.data);
          console.log("✅ ProfileSidebar: 사용자 데이터 로드 완료:", data.data);
        } else {
          throw new Error(
            data.message || "사용자 정보를 불러오는데 실패했습니다."
          );
        }
      } catch (err) {
        console.error("ProfileSidebar 사용자 데이터 로드 실패:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // --일반 / 소셜 회원 구분--
  const getAcccountType = (provider) => {
    switch (provider) {
      case "kakao":
        return "카카오 회원";
      case "google":
        return "구글 회원";
      default:
        return "일반 회원";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-gray-500">
          <p>사용자 정보를 불러오는 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-red-500">
          <p>오류: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const userCreatedAt = userData?.createdAt
    ? new Date(userData.createdAt)
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\. /g, ".")
        .replace(/\.$/, "")
    : "정보 없음";

  return (
    <Card>
      <CardContent className="pt-6">
        {/* 사용자 프로필 정보 */}
        <div className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage
              src={
                userData?.profileImageUrl ||
                "/placeholder.svg?height=96&width=96"
              }
            />
            <AvatarFallback className="text-lg">
              {/* 이름의 첫 글자를 표시 */}
              {userData?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          {/* API로 받아온 이름 표시 */}
          <h2 className="text-xl font-semibold">
            {userData?.name || "사용자"}
          </h2>
          {/* API로 받아온 이메일 표시 */}
          <p className="text-gray-600">
            {userData?.email || "이메일 정보 없음"}
          </p>
          <Badge className="mt-2">{getAcccountType(userData?.provider)}</Badge>
        </div>

        <Separator className="my-6" />

        {/* 사용자 통계 정보 (현재는 정적 데이터) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">가입일</span>
            <span className="text-sm font-medium">{userCreatedAt}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">읽은 기사</span>
            <span className="text-sm font-medium">{readArticleCount}개</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">스크랩</span>
            <span className="text-sm font-medium">{totalScraps}개</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
