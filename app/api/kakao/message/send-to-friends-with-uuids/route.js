import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 요청 데이터 파싱
    const body = await request.json();
    const { title, summary, url, receiverUuids, accessToken } = body;

    // 필수 필드 검증
    if (!title || !summary || !url || !receiverUuids || !accessToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: '필수 필드가 누락되었습니다. (title, summary, url, receiverUuids, accessToken)' 
        },
        { status: 400 }
      );
    }

    // receiverUuids가 배열인지 확인
    if (!Array.isArray(receiverUuids) || receiverUuids.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'receiverUuids는 비어있지 않은 배열이어야 합니다.' 
        },
        { status: 400 }
      );
    }

    // 최대 친구 수 제한 (카카오 API 제한)
    if (receiverUuids.length > 5) {
      return NextResponse.json(
        { 
          success: false, 
          error: '한 번에 최대 5명의 친구에게만 메시지를 보낼 수 있습니다.' 
        },
        { status: 400 }
      );
    }

    // 카카오 API를 통한 친구 메시지 전송
    const kakaoApiUrl = 'https://kapi.kakao.com/v1/api/talk/friends/message/default/send';
    
    // 메시지 템플릿 구성
    const templateObject = {
      object_type: 'feed',
      content: {
        title: title,
        description: summary,
        image_url: 'https://via.placeholder.com/800x400/667eea/ffffff?text=Newsletter',
        link: {
          web_url: url,
          mobile_web_url: url,
        },
      },
      social: {
        like_count: 0,
        comment_count: 0,
        shared_count: 0,
      },
      buttons: [
        {
          title: '뉴스레터 보기',
          link: {
            web_url: url,
            mobile_web_url: url,
          },
        },
        {
          title: '구독하기',
          link: {
            web_url: process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com',
            mobile_web_url: process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com',
          },
        },
      ],
    };

    // 카카오 API 호출
    const kakaoResponse = await fetch(kakaoApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        receiver_uuids: JSON.stringify(receiverUuids),
        template_object: JSON.stringify(templateObject),
      }),
    });

    const kakaoData = await kakaoResponse.json();

    if (!kakaoResponse.ok) {
      console.error('카카오 API 에러:', kakaoData);
      
      let errorMessage = '카카오 메시지 전송에 실패했습니다.';
      
      if (kakaoData.code === -401) {
        errorMessage = '인증이 필요합니다. 액세스 토큰을 확인해주세요.';
      } else if (kakaoData.code === -402) {
        errorMessage = '권한이 없습니다. 카카오톡 메시지 권한을 확인해주세요.';
      } else if (kakaoData.code === -403) {
        errorMessage = '쿼터를 초과했습니다. 잠시 후 다시 시도해주세요.';
      } else if (kakaoData.code === -404) {
        errorMessage = '친구 UUID를 찾을 수 없습니다.';
      }

      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          kakaoError: kakaoData 
        },
        { status: kakaoResponse.status }
      );
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: `${receiverUuids.length}명의 친구에게 메시지가 전송되었습니다.`,
      data: {
        sentCount: receiverUuids.length,
        receiverUuids: receiverUuids,
        kakaoResponse: kakaoData
      }
    });

  } catch (error) {
    console.error('카카오 친구 메시지 전송 API 에러:', error);
    
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
