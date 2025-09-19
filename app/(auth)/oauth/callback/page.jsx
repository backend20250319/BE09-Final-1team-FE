"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// ✅ API 호출 및 사용자 정보 저장을 위한 함수만 import 합니다.
import { authenticatedFetch, setUserInfo } from "@/lib/auth/auth";

/**
 * OAuth2 로그인 성공 후 리디렉션되는 콜백 페이지입니다.
 * 백엔드로부터 받은 HttpOnly 인증 쿠키를 사용하여 사용자 정보를 요청하고,
 * 성공 시 메인 페이지로 이동시킵니다.
 */
export default function OAuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("processing"); // 'processing' | 'success' | 'error'
  const [message, setMessage] = useState("로그인 정보를 확인 중입니다...");

  useEffect(() => {
    const fetchAndSetUserInfo = async () => {
      try {
        setMessage("사용자 정보를 요청하고 있습니다...");

        // ✅ 1. 백엔드에 내 정보를 요청합니다.
        // 브라우저가 자동으로 HttpOnly 인증 쿠키를 포함하여 전송합니다.
        console.log("🔍 OAuth 콜백: 사용자 정보 요청 중...");
        const response = await authenticatedFetch("/api/users/mypage"); // 내 정보 조회 API
        console.log("🔍 OAuth 콜백: API 응답 상태:", response.status);

        const result = await response.json();
        console.log("🔍 OAuth 콜백: API 응답 전체:", result);

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "사용자 정보를 가져오는 데 실패했습니다."
          );
        }

        const userInfo = result.data;
        console.log("🔍 OAuth 콜백: 추출된 사용자 정보:", userInfo);

        // ✅ 2. 서버로부터 받은 사용자 정보를 localStorage에 저장합니다.
        // 이 정보는 UI 렌더링 및 클라이언트 사이드 권한 확인에 사용됩니다.
        setUserInfo(userInfo);
        console.log("🔐 OAuth 로그인 성공 및 사용자 정보 저장 완료:", userInfo);

        setStatus("success");
        setMessage("로그인에 성공했습니다!");

        // 성공 후 메인 페이지로 이동
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } catch (error) {
        console.error("🚨 OAuth 콜백 처리 오류:", error);
        setStatus("error");
        setMessage(
          error.message || "로그인에 실패했습니다. 다시 시도해주세요."
        );

        // 에러 발생 시 로그인 페이지로 리디렉션
        setTimeout(() => {
          router.push("/auth");
        }, 3000);
      }
    };

    fetchAndSetUserInfo();
  }, []); // 컴포넌트가 처음 마운트될 때 한 번만 실행합니다.

  // ... (UI를 렌더링하는 나머지 코드는 기존과 동일합니다)
  const getStatusDisplay = () => {
    switch (status) {
      case "processing":
        return {
          emoji: "🔄",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      case "success":
        return {
          emoji: "✅",
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "error":
        return {
          emoji: "❌",
          color: "text-red-600",
          bgColor: "bg-red-50",
        };
      default:
        return {
          emoji: "🔄",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div
        className={`max-w-md w-full p-8 rounded-lg shadow-md ${statusDisplay.bgColor} text-center`}
      >
        <div className="text-6xl mb-4">{statusDisplay.emoji}</div>
        <h1 className={`text-xl font-semibold mb-2 ${statusDisplay.color}`}>
          OAuth 로그인 처리
        </h1>
        <p className={`${statusDisplay.color}`}>{message}</p>

        {status === "processing" && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}
