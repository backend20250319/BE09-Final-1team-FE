import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/config';

export async function GET(request) {
  try {
    console.log('카카오 권한 확인 API 호출');
    
    // 백엔드 API로 권한 확인 요청
    const backendUrl = getApiUrl('/api/kakao/permissions/talk-message');
    
    // JWT 쿠키를 백엔드로 전달
    const cookies = request.headers.get('cookie');
    
    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || '', // JWT 쿠키 전달
      },
    });

    const backendData = await backendResponse.json();
    
    console.log('백엔드 카카오 권한 확인 응답:', {
      status: backendResponse.status,
      success: backendData.success,
      hasPermission: backendData.hasPermission
    });

    if (!backendResponse.ok || !backendData.success) {
      return NextResponse.json({
        success: false,
        hasPermission: false,
        error: backendData.error || '카카오 권한 확인에 실패했습니다.'
      }, { status: backendResponse.status });
    }

    return NextResponse.json({
      success: true,
      hasPermission: backendData.hasPermission || false,
      scopes: backendData.scopes,
      userId: backendData.userId,
      userInfo: backendData.userInfo
    });

  } catch (error) {
    console.error('카카오 권한 확인 서버 에러:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        hasPermission: false,
        error: '서버 내부 오류가 발생했습니다.',
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