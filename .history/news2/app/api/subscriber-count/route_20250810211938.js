import { NextResponse } from "next/server";

// 환경변수에서 백엔드 URL 가져오기
const NEWS_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

export async function GET() {
  try {
    const res = await fetch(`${NEWS_API_BASE}/newsletter/count`, {
      cache: "no-store", // 실시간 데이터를 위해 캐시 비활성화
    });

    const data = await res.json();
    
    if (res.ok) {
      return NextResponse.json(data, { status: res.status });
    } else {
      return NextResponse.json(data, { status: res.status });
    }
  } catch (error) {
    console.error("구독자 수 조회 오류:", error);
    return NextResponse.json(
      { success: false, message: '백엔드 서버에 연결할 수 없습니다.' },
      { status: 503 }
    );
  }
}
