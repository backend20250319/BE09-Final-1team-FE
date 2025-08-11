import { NextRequest, NextResponse } from "next/server";

// 이메일 검증 함수
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 환경변수에서 백엔드 URL 가져오기
const NEWS_API_BASE = process.env.NEWS_API_BASE || "http://localhost:8082";

export async function POST(req) {
  try {
    const json = await req.json();
    const { email } = json;

    // 이메일 검증
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { message: "올바른 이메일 주소를 입력해주세요." },
        { status: 400 }
      );
    }

    // IP 기반 rate-limit (간단한 구현)
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    
    // 백엔드로 전달
    const res = await fetch(`${NEWS_API_BASE}/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, ip }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      return NextResponse.json(
        { message: errorData || "구독 처리 중 오류가 발생했습니다." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("구독 API 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
