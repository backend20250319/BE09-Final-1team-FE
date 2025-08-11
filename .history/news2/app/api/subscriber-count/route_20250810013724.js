import { NextResponse } from "next/server";

// 환경변수에서 백엔드 URL 가져오기
const NEWS_API_BASE = process.env.NEWS_API_BASE || "http://localhost:8082";

export async function GET() {
  try {
    const res = await fetch(`${NEWS_API_BASE}/newsletter/count`, {
      cache: "no-store", // 실시간 데이터를 위해 캐시 비활성화
    });

    if (!res.ok) {
      // 백엔드 오류 시 기본값 반환
      return NextResponse.json({ count: 0 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("구독자 수 조회 오류:", error);
    // 오류 시 기본값 반환
    return NextResponse.json({ count: 0 });
  }
}
