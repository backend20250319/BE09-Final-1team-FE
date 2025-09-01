"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTokens, setUserInfo, decodeJWT } from "@/lib/auth";

/**
 * OAuth2 로그인 성공 후 리디렉션되는 콜백 페이지입니다.
 * URL 쿼리 파라미터로 받은 Access Token과 Refresh Token을 안전하게 저장하고,
 * 사용자 정보를 추출하여 저장한 후 메인 페이지로 이동시킵니다.
 */
export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing"); // 'processing' | 'success' | 'error'
  const [message, setMessage] = useState("로그인 처리 중입니다...");

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // URL 쿼리에서 accessToken과 refreshToken을 추출합니다.
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");

        if (!accessToken || !refreshToken) {
          throw new Error("인증 토큰이 누락되었습니다.");
        }

        setMessage("토큰을 저장하고 있습니다...");

        // auth.js의 setTokens 함수를 사용하여 토큰을 안전하게 저장
        // (localStorage + 쿠키, 환경별 보안 설정 자동 적용)
        setTokens(accessToken, refreshToken);

        // JWT 토큰에서 사용자 정보 추출
        const userPayload = decodeJWT(accessToken);
        if (userPayload) {
          setMessage("사용자 정보를 저장하고 있습니다...");

          // 토큰에서 추출한 정보로 사용자 정보 구성
          const userInfo = {
            id: userPayload.sub || userPayload.userId,
            email: userPayload.email,
            name: userPayload.name || userPayload.username,
            role: userPayload.role || userPayload.authorities?.[0] || "user",
            exp: userPayload.exp,
            iat: userPayload.iat,
          };

          // auth.js의 setUserInfo 함수를 사용하여 사용자 정보 저장
          setUserInfo(userInfo);

          console.log("🔐 OAuth 로그인 성공:", {
            userId: userInfo.id,
            email: userInfo.email,
            role: userInfo.role,
          });
        }

        setStatus("success");
        setMessage("로그인에 성공했습니다!");

        // 성공 후 약간의 지연을 두고 메인 페이지로 이동
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } catch (error) {
        console.error("🚨 OAuth 콜백 처리 오류:", error);
        setStatus("error");
        setMessage(
          error.message || "로그인에 실패했습니다. 다시 시도해주세요."
        );

        // 에러 발생 시 3초 후 로그인 페이지로 리디렉션
        setTimeout(() => {
          router.push("/auth");
        }, 3000);
      }
    };

    handleOAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 컴포넌트가 처음 마운트될 때 한 번만 실행합니다.

  // 상태에 따른 메시지와 스타일 반환
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

        {status === "error" && (
          <p className="text-sm text-gray-500 mt-2">
            잠시 후 로그인 페이지로 이동합니다...
          </p>
        )}

        {status === "success" && (
          <p className="text-sm text-gray-500 mt-2">
            메인 페이지로 이동합니다...
          </p>
        )}
      </div>
    </div>
  );
}
