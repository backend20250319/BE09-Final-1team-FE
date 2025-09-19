import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/utils/config';

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

    const backendData = await backendResponse.json().catch(() => ({
      success: false,
      error: '백엔드 응답 파싱 실패'
    }));
    
    console.log('백엔드 카카오 권한 확인 응답:', {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      success: backendData.success,
      hasPermission: backendData.hasPermission,
      error: backendData.error
    });

    if (!backendResponse.ok || !backendData.success) {
      return NextResponse.json({
        success: false,
        hasPermission: false,
        error: backendData.error || `백엔드 API 오류 (${backendResponse.status}: ${backendResponse.statusText})`
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
    console.error('카카오 권한 확인 서버 에러:', {
      error: error.message || '알 수 없는 오류',
      name: error.name,
      code: error.code,
      stack: error.stack,
      url: '/api/kakao/permissions/talk-message',
      timestamp: new Date().toISOString(),
      errorType: error.constructor.name
    });
    
    // 백엔드 연결 실패인 경우 구체적인 메시지 제공
    let errorMessage = '서버 내부 오류가 발생했습니다.';
    if (error.code === 'ECONNREFUSED') {
      errorMessage = '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = '백엔드 서버를 찾을 수 없습니다. API URL 설정을 확인해주세요.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        hasPermission: false,
        error: errorMessage,
        details: error.message,
        code: error.code
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