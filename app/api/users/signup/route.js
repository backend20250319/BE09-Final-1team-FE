import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // 기본적인 유효성 검사
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: '필수 필드가 누락되었습니다.' },
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

    // 비밀번호 길이 검사
    if (body.password.length < 8) {
      return NextResponse.json(
        { success: false, message: '비밀번호는 최소 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 백엔드 API 호출
    const backendUrl = getBackendUrl('api/auth/signup');
    console.log('백엔드 회원가입 API 호출:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        password: body.password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // 백엔드에서 성공 응답을 받은 경우
      return NextResponse.json({
        success: true,
        message: '회원가입이 완료되었습니다.',
        data: data.data || data
      });
    } else {
      // 백엔드에서 오류 응답을 받은 경우
      return NextResponse.json({
        success: false,
        message: data.message || '회원가입에 실패했습니다.',
      }, { status: response.status });
    }

  } catch (error) {
    console.error('회원가입 API 에러:', error);
    
    // 백엔드 서버가 실행되지 않은 경우를 위한 임시 처리
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch')) {
      console.log('백엔드 서버가 실행되지 않음. 임시 회원가입 처리...');
      
      return NextResponse.json({
        success: true,
        message: '회원가입이 완료되었습니다. (임시 모드)',
        data: {
          userId: Math.floor(Math.random() * 10000) + 1,
          email: body.email,
          name: body.name
        }
      });
    }

    return NextResponse.json(
      { success: false, message: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
