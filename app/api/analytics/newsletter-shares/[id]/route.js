import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/utils/config";

// /api/analytics/newsletter-shares/[id] - 공유 통계 조회
export async function GET(request, { params }) {
  try {
    const accessToken = cookies().get("access-token")?.value;
    
    if (!accessToken) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const newsletterId = params.id;
    
    // 백엔드 API로 공유 통계 조회
    const backendUrl = getApiUrl(`/api/analytics/newsletter-shares/${newsletterId}`);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return NextResponse.json({
      total: result.total || 0,
      recent: result.recent || 0,
      byMethod: result.byMethod || {}
    });
  } catch (error) {
    console.error('공유 통계 조회 실패:', error);
    return NextResponse.json({ error: '통계 조회 실패' }, { status: 500 });
  }
}