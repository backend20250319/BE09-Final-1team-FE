import { NextResponse } from "next/server";

export async function POST(request) {
  let body;

  try {
    body = await request.json();

    // 기본적인 유효성 검사
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, message: "올바른 이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검사 (최소 6자)
    if (body.password.length < 6) {
      return NextResponse.json(
        { success: false, message: "비밀번호는 최소 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // deviceId 검사 (선택사항이지만 있다면 유효성 검사)
    if (body.deviceId && typeof body.deviceId !== "string") {
      return NextResponse.json(
        { success: false, message: "디바이스 ID가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    console.log("✅ 로그인 데이터 유효성 검사 통과:", { email: body.email });

    // ✅ 유효성 검사 통과 - auth.js에서 직접 백엔드 호출하도록 성공 응답 반환
    return NextResponse.json({
      success: true,
      message: "유효성 검사 완료",
      validatedData: {
        email: body.email,
        password: body.password,
        deviceId: body.deviceId,
      },
    });
  } catch (error) {
    console.error("로그인 유효성 검사 API 에러:", error);

    // JSON 파싱 에러나 기타 예상치 못한 에러 처리
    return NextResponse.json(
      { success: false, message: "요청 데이터를 처리할 수 없습니다." },
      { status: 400 }
    );
  }
}
