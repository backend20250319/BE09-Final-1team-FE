import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/utils/config';

export async function GET(request) {
  try {
    console.log('🔍 Collections List API Debug:', {
      originalUrl: request.url
    });

    // 게이트웨이를 통해 컬렉션 목록 조회 (임시로 직접 서비스 URL 테스트)
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? getApiUrl('/api/news/collections')
      : 'http://news-service:8082/api/news/collections'; // EKS 내부 서비스 URL
    
    const accessToken = cookies().get('access-token')?.value;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log('📡 Backend Collections API 호출:', {
      url: backendUrl,
      hasAuth: !!accessToken,
      nodeEnv: process.env.NODE_ENV,
      backendUrl: process.env.BACKEND_URL
    });

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: headers,
    });

    console.log('📡 Backend Collections API 응답:', {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      ok: backendResponse.ok
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend Collections API 실패:', { 
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
    console.log('✅ Backend Collections 응답:', data);

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const collectionsData = data.content || data.data || data || [];
    
    // 배열인지 확인하고 안전하게 처리
    const safeData = Array.isArray(collectionsData) ? collectionsData : [];
    
    const transformedData = {
      success: true,
      data: safeData
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('❌ Collections API 오류:', error);
    
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

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('🔍 Create Collection API Debug:', {
      body,
      originalUrl: request.url
    });

    // 게이트웨이를 통해 컬렉션 생성
    const backendUrl = getApiUrl('/api/news/collections');
    
    const accessToken = cookies().get('access-token')?.value;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log('📡 Backend Create Collection API 호출:', {
      url: backendUrl,
      hasAuth: !!accessToken
    });

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });

    console.log('📡 Backend Create Collection API 응답:', {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      ok: backendResponse.ok
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend Create Collection API 실패:', { 
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
    console.log('✅ Backend Create Collection 응답:', data);

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const transformedData = {
      success: true,
      data: data
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('❌ Create Collection API 오류:', error);
    
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
