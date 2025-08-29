import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/config";
import { AdditionalInfoRequestSchema } from "@/lib/schemas";

export async function POST(request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");

    // Authorization 헤더 확인
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "인증 토큰이 필요합니다." },
        { status: 401 }
      );
    }

    const tempToken = authHeader.replace("Bearer ", "");

    // 요청 데이터 유효성 검사
    try {
      AdditionalInfoRequestSchema.parse(body);
    } catch (validationError) {
      console.error("추가 정보 요청 데이터 검증 실패:", validationError);
      return NextResponse.json(
        {
          success: false,
          message:
            validationError.errors?.[0]?.message ||
            "입력 데이터 형식이 올바르지 않습니다.",
        },
        { status: 400 }
      );
    }

    // 백엔드 API 호출
    const backendUrl = getBackendUrl("api/auth/additional-info");
    console.log("백엔드 추가 정보 API 호출:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tempToken}`, // 임시 토큰을 백엔드로 전달
      },
      body: JSON.stringify({
        birthYear: body.birthYear,
        gender: body.gender,
        hobbies: body.hobbies || [],
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // 백엔드에서 성공 응답을 받은 경우 (최종 토큰 포함)
      return NextResponse.json({
        success: true,
        message: "추가 정보가 저장되었습니다.",
        data: data.data || data,
      });
    } else {
      // 백엔드에서 오류 응답을 받은 경우
      return NextResponse.json(
        {
          success: false,
          message: data.message || "추가 정보 저장에 실패했습니다.",
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("추가 정보 API 에러:", error);

    // 백엔드 서버가 실행되지 않은 경우를 위한 임시 처리
    if (error.code === "ECONNREFUSED" || error.message.includes("fetch")) {
      console.log("백엔드 서버가 실행되지 않음. 임시 추가 정보 처리...");

      return NextResponse.json({
        success: true,
        message: "추가 정보가 저장되었습니다. (임시 모드)",
        data: {
          accessToken: "temp_access_token_" + Date.now(),
          refreshToken: "temp_refresh_token_" + Date.now(),
          user: {
            id: Math.floor(Math.random() * 10000) + 1,
            email: "temp@example.com",
            name: "임시 사용자",
          },
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
