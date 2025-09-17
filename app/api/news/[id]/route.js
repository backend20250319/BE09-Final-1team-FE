import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/utils/config';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        error: 'News ID is required' 
      }, { status: 400 });
    }

    console.log('🔍 News Detail API Debug:', {
      newsId: id,
      originalUrl: request.url
    });

    // 게이트웨이를 통해 뉴스 세부 정보 조회
    const backendUrl = getApiUrl(`/api/news/${id}`);
    
    const accessToken = cookies().get('access-token')?.value;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log('📡 Backend News Detail API 호출:', {
      url: backendUrl,
      hasAuth: !!accessToken
    });

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: headers,
    });

    console.log('📡 Backend News Detail API 응답:', {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      ok: backendResponse.ok
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend News Detail API 실패:', { 
        status: backendResponse.status, 
        statusText: backendResponse.statusText,
        errorText,
        url: backendUrl
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorText || `Backend API error (${backendResponse.status})`,
          status: backendResponse.status 
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log('✅ Backend News Detail 응답:', data);

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const transformedData = {
      success: true,
      data: data
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('❌ News Detail API 오류:', error);
    
    // 네트워크 에러인 경우
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Backend server connection failed',
          message: '백엔드 서버에 연결할 수 없습니다. 서버 상태를 확인해주세요.'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal Server Error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
