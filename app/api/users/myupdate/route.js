import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    const body = await request.json();
    
    // 백엔드 서버가 실행되지 않은 경우를 위한 임시 응답
    console.log('업데이트 요청 데이터:', body);
    
    const mockResponse = {
      success: true,
      message: '프로필이 성공적으로 업데이트되었습니다.',
      data: {
        letterOk: body.letterOk || false,
        hobbies: body.hobbies || [],
        updatedAt: new Date().toISOString()
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('프로필 업데이트 API 오류:', error);
    return NextResponse.json(
      { success: false, message: '프로필 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
