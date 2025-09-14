import { NextResponse } from 'next/server';
import { getNewsletterServiceUrl } from '@/lib/utils/config';

export async function GET(request, { params }) {
  try {
    const { deliveryId } = params;
    console.log('뉴스레터 발송 상태 확인 API 호출 - deliveryId:', deliveryId);
    
    // 백엔드 API로 발송 상태 확인 요청
    const backendUrl = getNewsletterServiceUrl(`/api/newsletter/delivery/status/${deliveryId}`);
    
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
    
    console.log('백엔드 뉴스레터 발송 상태 확인 응답:', {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      success: backendData.success,
      data: backendData.data,
      error: backendData.error
    });

    if (!backendResponse.ok || !backendData.success) {
      return NextResponse.json({
        success: false,
        error: backendData.error || `백엔드 API 오류 (${backendResponse.status}: ${backendResponse.statusText})`
      }, { status: backendResponse.status });
    }

    return NextResponse.json({
      success: true,
      data: backendData.data,
      message: backendData.message || '발송 상태를 조회했습니다.'
    });

  } catch (error) {
    console.error('뉴스레터 발송 상태 확인 서버 에러:', {
      error: error.message || '알 수 없는 오류',
      name: error.name,
      code: error.code,
      stack: error.stack,
      url: `/api/newsletter/delivery/status/${params.deliveryId}`,
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
