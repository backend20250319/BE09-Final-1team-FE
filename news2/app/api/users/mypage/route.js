import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // 백엔드 서버가 실행되지 않은 경우를 위한 임시 응답
    const mockUserData = {
      success: true,
      data: {
        id: 1,
        name: "테스트 사용자",
        email: "test@example.com",
        profileImageUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        hobbies: ["정치", "사회", "기술"],
        letterOk: true
      }
    };

    return NextResponse.json(mockUserData);
  } catch (error) {
    console.error('마이페이지 API 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 