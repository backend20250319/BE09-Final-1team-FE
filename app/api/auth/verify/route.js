import { NextResponse } from 'next/server';
import { getUserInfo, isAuthenticated } from '@/lib/auth/auth';

export async function GET(request) {
  try {
    // 현재 인증 상태 확인
    const userInfo = getUserInfo();
    const isAuth = isAuthenticated();
    
    if (!isAuth || !userInfo) {
      return NextResponse.json(
        { 
          success: false, 
          error: '세션이 만료되었습니다.',
          isAuthenticated: false
        },
        { status: 401 }
      );
    }

    // 세션 유효성 검증
    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('세션 검증 에러:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: '세션 검증 중 오류가 발생했습니다.',
        isAuthenticated: false,
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// OPTIONS 메서드 지원 (CORS)
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    },
  });
}
