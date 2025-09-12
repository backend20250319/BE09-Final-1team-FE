import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/utils/config";

// /api/newsletters/[id]/preview - 뉴스레터 미리보기 (개인화 적용)
export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access-token")?.value;
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // ID 유효성 검사
    if (!id || isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 뉴스레터 ID입니다.',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    // 백엔드 API URL
    const backendUrl = getApiUrl(`/api/newsletters/${id}/preview`);
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // 인증 토큰이 있으면 헤더에 추가
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // 쿼리 파라미터 추가
    const queryParams = new URLSearchParams();
    if (userId) {
      queryParams.append('userId', userId);
    }
    
    const urlWithQuery = queryParams.toString() 
      ? `${backendUrl}?${queryParams.toString()}`
      : backendUrl;

    const response = await fetch(urlWithQuery, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(5000) // 5초 타임아웃
    });

    if (response.ok) {
      const newsletterData = await response.json();
      
      return NextResponse.json({
        success: true,
        data: newsletterData,
        message: '뉴스레터 미리보기를 성공적으로 가져왔습니다.'
      });
    } else if (response.status === 404) {
      return NextResponse.json({
        success: false,
        message: `뉴스레터 ID ${id}를 찾을 수 없습니다.`,
        code: 'NOT_FOUND'
      }, { status: 404 });
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
  } catch (error) {
    console.error('뉴스레터 미리보기 API 에러:', error);
    
    return NextResponse.json({
      success: false,
      message: '뉴스레터 미리보기를 불러오는데 실패했습니다.',
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}
