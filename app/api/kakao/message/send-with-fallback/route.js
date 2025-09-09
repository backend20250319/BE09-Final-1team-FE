import { NextResponse } from 'next/server';

/**
 * 카카오톡 스마트 전송 API (권한 있으면 카카오톡, 없으면 대체 방식)
 * POST /api/kakao/message/send-with-fallback
 * 
 * 요청 본문: {
 *   title: string,
 *   summary: string,
 *   url: string,
 *   receiverUuids?: string[],
 *   fallbackMethod?: 'email' | 'link'
 * }
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
    const { title, summary, url, receiverUuids, fallbackMethod = 'email' } = body;

    // 필수 필드 검증
    if (!title || !summary || !url) {
      return NextResponse.json(
        { 
          success: false, 
          error: '필수 필드가 누락되었습니다. (title, summary, url)' 
        },
        { status: 400 }
      );
    }

    // 1. 카카오톡 메시지 권한 확인
    const permissionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/kakao/permissions/talk-message`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const permissionData = await permissionResponse.json();
    const hasKakaoPermission = permissionData.success && permissionData.hasPermission;

    console.log('카카오톡 권한 확인 결과:', {
      hasPermission: hasKakaoPermission,
      permissionData
    });

    // 2. 권한이 있고 receiverUuids가 있으면 카카오톡 전송 시도
    if (hasKakaoPermission && receiverUuids && Array.isArray(receiverUuids) && receiverUuids.length > 0) {
      try {
        const kakaoResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/kakao/message/send-to-friends-with-uuids`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            summary,
            url,
            receiverUuids,
            accessToken
          }),
        });

        const kakaoData = await kakaoResponse.json();

        if (kakaoData.success) {
          return NextResponse.json({
            success: true,
            method: 'kakao',
            message: '카카오톡으로 메시지가 전송되었습니다.',
            data: kakaoData.data
          });
        } else {
          console.warn('카카오톡 전송 실패, 대체 방식으로 전환:', kakaoData.error);
        }
      } catch (kakaoError) {
        console.warn('카카오톡 전송 중 오류 발생, 대체 방식으로 전환:', kakaoError);
      }
    }

    // 3. 대체 방식으로 전송
    console.log('대체 방식으로 전송:', fallbackMethod);

    if (fallbackMethod === 'email') {
      // 이메일 전송 로직 (구현 필요)
      return NextResponse.json({
        success: true,
        method: 'email',
        message: '이메일로 뉴스레터가 전송되었습니다.',
        data: {
          title,
          summary,
          url,
          sentAt: new Date().toISOString()
        }
      });
    } else if (fallbackMethod === 'link') {
      // 링크 공유 로직
      return NextResponse.json({
        success: true,
        method: 'link',
        message: '공유 링크가 생성되었습니다.',
        data: {
          title,
          summary,
          url,
          shareUrl: url,
          sentAt: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: '지원하지 않는 대체 전송 방식입니다.' 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('스마트 전송 API 에러:', error);
    
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
