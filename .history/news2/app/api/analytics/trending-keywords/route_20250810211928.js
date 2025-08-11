import { NextResponse } from "next/server";

/**
 * GET /api/analytics/trending-keywords
 * 트렌딩 키워드를 분석하여 반환합니다
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h'; // 24h, 7d, 30d
    const limit = parseInt(searchParams.get('limit')) || 10;

    // 백엔드 서버로 요청 전달
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8082';
    const params = new URLSearchParams();
    params.append('period', period);
    params.append('limit', limit.toString());
    
    const response = await fetch(`${backendUrl}/analytics/trending-keywords?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      return NextResponse.json(data, { status: response.status });
    }
    
  } catch (error) {
    console.error('트렌딩 키워드 분석 오류:', error);
    return NextResponse.json(
      { success: false, message: '백엔드 서버에 연결할 수 없습니다.' },
      { status: 503 }
    );
  }
}
