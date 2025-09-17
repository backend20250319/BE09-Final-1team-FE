import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/utils/config";

// /api/auth/me - 사용자 정보 조회 (쿠키 기반)
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access-token")?.value;
    
    if (!accessToken) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    // 백엔드 API로 사용자 정보 조회
    const backendUrl = getApiUrl('/api/auth/me');
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: '인증이 만료되었습니다' }, { status: 401 });
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const userData = await response.json();
    
    // 표준화된 응답 형식으로 반환
    return NextResponse.json({
      success: true,
      data: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'user', // role 필드 추가
        loginMethod: userData.loginMethod, // 'kakao' | 'email'
        provider: userData.provider,
        preferences: {
          categories: userData.preferences?.categories || [],
          notifications: userData.preferences?.notifications || true,
          personalizedContent: userData.preferences?.personalizedContent || true
        },
        createdAt: userData.createdAt
      }
    });
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    return NextResponse.json({ error: '사용자 정보 조회 실패' }, { status: 500 });
  }
}
