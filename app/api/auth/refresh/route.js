import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/utils/config";

// 토큰 갱신 API 엔드포인트
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh-token")?.value;
    
    if (!refreshToken) {
      return NextResponse.json({ error: '리프레시 토큰이 없습니다' }, { status: 401 });
    }

    // 백엔드 API로 토큰 갱신 요청
    const backendUrl = getApiUrl('/api/auth/refresh');
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: '리프레시 토큰이 만료되었습니다' }, { status: 401 });
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const tokenData = await response.json();
    
    // 새로운 토큰을 쿠키로 설정
    const response_data = NextResponse.json({
      success: true,
      message: '토큰이 갱신되었습니다'
    });

    // 새로운 액세스 토큰을 HttpOnly 쿠키로 설정
    if (tokenData.accessToken) {
      response_data.cookies.set('access-token', tokenData.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7일
      });
    }

    // 새로운 리프레시 토큰이 있다면 설정
    if (tokenData.refreshToken) {
      response_data.cookies.set('refresh-token', tokenData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30일
      });
    }
    
    return response_data;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    return NextResponse.json({ error: '토큰 갱신 실패' }, { status: 500 });
  }
}
