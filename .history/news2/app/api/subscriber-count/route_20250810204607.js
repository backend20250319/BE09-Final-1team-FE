import { NextResponse } from "next/server";

// 환경변수에서 백엔드 URL 가져오기
const NEWS_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

export async function GET() {
  try {
    try {
      const res = await fetch(`${NEWS_API_BASE}/newsletter/count`, {
        cache: "no-store", // 실시간 데이터를 위해 캐시 비활성화
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      } else {
        console.log('⚠️ 백엔드 구독자 수 API 실패, 프론트엔드 처리로 전환');
        throw new Error('BACKEND_UNAVAILABLE');
      }
    } catch (backendError) {
      // 백엔드 서버가 응답하지 않거나 403 오류 발생 시
      console.log('🔄 프론트엔드 구독자 수 처리 시작');
      
      // 임시 구독자 수 생성 (실제로는 데이터베이스에서 가져와야 함)
      const mockCount = Math.floor(Math.random() * 1000) + 500; // 500-1500 사이의 랜덤 수
      
      return NextResponse.json({ 
        count: mockCount,
        message: '프론트엔드 처리 (임시 데이터)'
      });
    }
  } catch (error) {
    console.error("구독자 수 조회 오류:", error);
    // 최종 폴백: 기본값 반환
    return NextResponse.json({ count: 0 });
  }
}
