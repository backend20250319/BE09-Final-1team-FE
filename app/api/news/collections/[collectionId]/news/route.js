import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/utils/config';

export async function GET(request, { params }) {
  try {
    const { collectionId } = params;
    
    if (!collectionId) {
      return NextResponse.json({ 
        error: 'Collection ID is required' 
      }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '12';
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || '';

    console.log('🔍 Collection News API Debug:', {
      collectionId,
      page,
      size,
      query,
      category,
      originalUrl: request.url
    });

    // 백엔드 서버 URL 설정
    const backendBaseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    
    console.log('🔍 Collection News API 환경변수 체크:', {
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
    
    let backendUrl = `${backendBaseUrl}/api/news/collections/${collectionId}/news?page=${page}&size=${size}`;
    if (query) backendUrl += `&query=${encodeURIComponent(query)}`;
    if (category) backendUrl += `&category=${encodeURIComponent(category)}`;
    
    const accessToken = cookies().get('access-token')?.value;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log('📡 Backend Collection News API 호출:', {
      url: backendUrl,
      hasAuth: !!accessToken
    });

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: headers,
    });

    console.log('📡 Backend Collection News API 응답:', {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      ok: backendResponse.ok
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend Collection News API 실패:', { 
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
    console.log('✅ Backend Collection News 응답:', data);

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const transformedData = {
      success: true,
      data: data
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('❌ Collection News API 오류:', error);
    
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

export async function POST(request, { params }) {
  try {
    const { collectionId } = params;
    
    if (!collectionId) {
      return NextResponse.json({ 
        error: 'Collection ID is required' 
      }, { status: 400 });
    }

    // 요청 본문 파싱 시 에러 처리 개선
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', parseError);
      return NextResponse.json({
        success: false,
        error: '잘못된 요청 형식입니다.',
        message: 'JSON 파싱 실패'
      }, { status: 400 });
    }

    console.log('🔍 Add News to Collection API Debug:', {
      collectionId,
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
    const backendUrl = `${backendBaseUrl}/api/news/collections/${collectionId}/news`;
    
    const accessToken = cookies().get('access-token')?.value;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log('📡 Backend Add News to Collection API 호출:', {
      url: backendUrl,
      hasAuth: !!accessToken,
      body: body
    });

    let backendResponse;
    try {
      backendResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });
    } catch (fetchError) {
      console.error('❌ Backend API 호출 실패:', fetchError);
      return NextResponse.json({
        success: false,
        error: '백엔드 서버 연결 실패',
        message: fetchError.message
      }, { status: 503 });
    }

    console.log('📡 Backend Add News to Collection API 응답:', {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      ok: backendResponse.ok
    });

    if (!backendResponse.ok) {
      let errorText;
      try {
        errorText = await backendResponse.text();
      } catch (textError) {
        console.error('❌ 에러 응답 읽기 실패:', textError);
        errorText = `HTTP ${backendResponse.status} Error`;
      }
      
      console.error('❌ Backend Add News to Collection API 실패:', { 
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

    let data;
    try {
      data = await backendResponse.json();
    } catch (jsonError) {
      console.error('❌ Backend 응답 JSON 파싱 실패:', jsonError);
      return NextResponse.json({
        success: false,
        error: '백엔드 응답 파싱 실패',
        message: 'Invalid JSON response from backend'
      }, { status: 500 });
    }
    
    console.log('✅ Backend Add News to Collection 응답:', data);

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const transformedData = {
      success: true,
      data: data
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('❌ Add News to Collection API 오류:', error);
    
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
