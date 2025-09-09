import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { category, subscription } = body;

    // 필수 필드 검증
    if (!category) {
      return NextResponse.json(
        { 
          success: false, 
          error: '카테고리가 필요합니다.' 
        },
        { status: 400 }
      );
    }

    // 웹 푸시 구독 정보 저장
    // 실제 구현에서는 데이터베이스에 저장
    const subscriptionData = {
      category,
      subscription,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    console.log('웹 푸시 구독 정보:', subscriptionData);

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '웹 푸시 구독이 완료되었습니다.',
      data: {
        category,
        subscriptionId: `webpush_${Date.now()}`,
        createdAt: subscriptionData.createdAt
      }
    });

  } catch (error) {
    console.error('웹 푸시 구독 API 에러:', error);
    
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
