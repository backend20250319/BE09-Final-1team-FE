import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/utils/config';

export async function GET(request) {
  try {
    console.log('🔍 Collections List API Debug:', {
      originalUrl: request.url
    });

    // 백엔드 서버 URL 설정
    // BACKEND_URL 환경변수 사용, 없으면 NEXT_PUBLIC_API_URL 사용
    const backendBaseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    
    console.log('🔍 Collections API 환경변수 체크:', {
      BACKEND_URL: process.env.BACKEND_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      selectedUrl: backendBaseUrl
    });
    
    if (!backendBaseUrl) {
      console.error('❌ BACKEND_URL 또는 NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.');
      return NextResponse.json({ 
        success: false,
        error: '서버 설정 오류',
        message: '백엔드 서버 URL이 설정되지 않았습니다.' 
      }, { status: 500 });
    }
    const fullBackendUrl = `${backendBaseUrl}/api/news/collections`;
    
    const accessToken = cookies().get('access-token')?.value;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log('📡 Backend Collections API 호출:', {
      url: fullBackendUrl,
      hasAuth: !!accessToken,
      nodeEnv: process.env.NODE_ENV,
      backendUrl: process.env.BACKEND_URL
    });

    const backendResponse = await fetch(fullBackendUrl, {
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
        url: fullBackendUrl
      });
      
      // 503 에러인 경우 특별 처리
      if (backendResponse.status === 503) {
        return NextResponse.json(
          { 
            success: false, 
            error: '백엔드 서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
            status: 503 
          },
          { status: 503 }
        );
      }
      
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
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch') || error.message.includes('ENOTFOUND')) {
      return NextResponse.json(
        { 
          success: false,
          error: '백엔드 서버에 연결할 수 없습니다.',
          message: '서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
          details: `연결 실패: ${error.message}`
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

    // 백엔드 서버 URL 설정
    const backendBaseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!backendBaseUrl) {
      console.error('❌ BACKEND_URL 또는 NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.');
      return NextResponse.json({ 
        success: false,
        error: '서버 설정 오류',
        message: '백엔드 서버 URL이 설정되지 않았습니다.' 
      }, { status: 500 });
    }
    const backendUrl = `${backendBaseUrl}/api/news/collections`;
    
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
