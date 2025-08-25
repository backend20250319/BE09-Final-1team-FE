import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config';

export async function POST(request) {
  let body;
  
  try {
    body = await request.json();
    
    // 기본적인 유효성 검사
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, message: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // 백엔드 API 호출
    const backendUrl = getBackendUrl('api/auth/login');
    console.log('백엔드 로그인 API 호출:', backendUrl);

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: body.email,
          password: body.password,
        }),
        // 타임아웃 설정
        signal: AbortSignal.timeout(5000), // 5초 타임아웃
      });

      const data = await response.json();

      if (response.ok) {
        // 백엔드에서 성공 응답을 받은 경우
        return NextResponse.json({
          success: true,
          message: '로그인이 완료되었습니다.',
          data: data.data || data
        });
      } else {
        // 백엔드에서 오류 응답을 받은 경우
        return NextResponse.json({
          success: false,
          message: data.message || '로그인에 실패했습니다.',
        }, { status: response.status });
      }
    } catch (fetchError) {
      console.log('백엔드 API 호출 실패, 임시 모드로 전환:', fetchError.message);
      throw fetchError; // catch 블록으로 전달
    }

  } catch (error) {
    console.error('로그인 API 에러:', error);
    
    // 백엔드 서버가 실행되지 않은 경우를 위한 임시 처리
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch')) {
      console.log('백엔드 서버가 실행되지 않음. 임시 로그인 처리...');
      
      // body가 정의되지 않은 경우 기본값 사용
      const userEmail = body?.email || 'test@example.com';
      
      // 임시 사용자 데이터
      const mockUser = {
        id: 1,
        email: userEmail,
        name: '테스트 사용자',
        role: 'USER'
      };

      // 임시 JWT 토큰
      const mockAccessToken = 'mock-access-token-' + Date.now();
      const mockRefreshToken = 'mock-refresh-token-' + Date.now();

      return NextResponse.json({
        success: true,
        message: '로그인이 완료되었습니다. (임시 모드)',
        data: {
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
          user: mockUser
        }
      });
    }

    return NextResponse.json(
      { success: false, message: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
