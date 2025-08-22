import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // 기본적인 유효성 검사
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검사
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: '비밀번호는 최소 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // TODO: 실제 백엔드 API 호출
    // 현재는 임시로 성공 응답을 반환
    console.log('회원가입 요청 데이터:', body);

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        userId: Math.floor(Math.random() * 10000) + 1, // 임시 ID
        email: body.email
      }
    });

  } catch (error) {
    console.error('회원가입 API 에러:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
