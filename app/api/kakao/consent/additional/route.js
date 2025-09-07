import { NextResponse } from 'next/server';

/**
 * 카카오 추가 동의 요청 API
 * POST /api/kakao/consent/additional
 * 
 * 요청 본문: { scopes: ['talk_message'] }
 * 응답: { consentUrl: string }
 */
export async function POST(request) {
  try {
    // Authorization 헤더에서 액세스 토큰 추출
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: '액세스 토큰이 필요합니다.' 
        },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // 요청 본문 파싱
    const body = await request.json();
    const { scopes } = body;

    if (!scopes || !Array.isArray(scopes) || scopes.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '추가 동의가 필요한 스코프 목록이 필요합니다.' 
        },
        { status: 400 }
      );
    }

    // talk_message 스코프 검증
    const validScopes = ['talk_message'];
    const invalidScopes = scopes.filter(scope => !validScopes.includes(scope));
    
    if (invalidScopes.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `지원하지 않는 스코프입니다: ${invalidScopes.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // 카카오 추가 동의 URL 생성
    const kakaoAppKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
    if (!kakaoAppKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: '카카오 앱 키가 설정되지 않았습니다.' 
        },
        { status: 500 }
      );
    }

    // 현재 도메인 정보
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = request.headers.get('host');
    const redirectUri = `${protocol}://${host}/auth/oauth/callback`;

    // 카카오 추가 동의 URL 생성
    const consentParams = new URLSearchParams({
      client_id: kakaoAppKey,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      prompt: 'consent', // 추가 동의 강제 요청
      state: 'additional_consent' // 추가 동의임을 표시
    });

    const consentUrl = `https://kauth.kakao.com/oauth/authorize?${consentParams.toString()}`;

    console.log('카카오 추가 동의 URL 생성:', {
      scopes,
      redirectUri,
      consentUrl: consentUrl.substring(0, 100) + '...'
    });

    return NextResponse.json({
      success: true,
      consentUrl: consentUrl,
      scopes: scopes,
      redirectUri: redirectUri
    });

  } catch (error) {
    console.error('카카오 추가 동의 URL 생성 실패:', error);
    
    return NextResponse.json(
      { 
        success: false, 
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
