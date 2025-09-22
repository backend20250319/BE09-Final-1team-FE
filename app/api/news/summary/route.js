import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST /api/news/summary - 텍스트 기반 요약 생성 (newsId 없이)
export async function POST(request) {
  try {
    // 요청 본문 파싱
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

    const { text, type, lines, prompt } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({
        success: false,
        error: '텍스트가 필요합니다.',
        message: 'text 필드는 필수입니다.'
      }, { status: 400 });
    }

    console.log('🔍 Text Summary API Debug:', {
      textLength: text.length,
      type,
      lines,
      hasPrompt: !!prompt,
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

    const backendUrl = `${backendBaseUrl}/api/news/summary`;
    
    const accessToken = cookies().get('access-token')?.value;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log('📡 Backend Text Summary API 호출:', {
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

    console.log('📡 Backend Text Summary API 응답:', {
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
      
      console.error('❌ Backend Text Summary API 실패:', { 
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
    
    console.log('✅ Backend Text Summary 응답:', data);

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const transformedData = {
      success: true,
      ...data
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('❌ Text Summary API 오류:', error);
    
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
