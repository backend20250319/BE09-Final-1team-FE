import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // 실제 구현에서는 사용자 인증 확인 후 데이터베이스에서 설정 조회
    const defaultSettings = {
      kakaoNewsletter: false,
      emailNewsletter: true,
      webPush: false,
      smsAlerts: false,
      marketingEmails: false,
      frequency: 'daily',
      time: '07:00'
    };

    return NextResponse.json({
      success: true,
      settings: defaultSettings
    });

  } catch (error) {
    console.error('알림 설정 조회 에러:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: '알림 설정을 조회할 수 없습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { settings } = body;

    // 실제 구현에서는 사용자 인증 확인 후 데이터베이스에 설정 저장
    console.log('알림 설정 저장:', settings);

    // 설정 유효성 검증
    const validSettings = {
      kakaoNewsletter: Boolean(settings.kakaoNewsletter),
      emailNewsletter: Boolean(settings.emailNewsletter),
      webPush: Boolean(settings.webPush),
      smsAlerts: Boolean(settings.smsAlerts),
      marketingEmails: Boolean(settings.marketingEmails),
      frequency: ['daily', 'weekly', 'none'].includes(settings.frequency) ? settings.frequency : 'daily',
      time: settings.time || '07:00'
    };

    return NextResponse.json({
      success: true,
      message: '알림 설정이 저장되었습니다.',
      settings: validSettings
    });

  } catch (error) {
    console.error('알림 설정 저장 에러:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: '알림 설정을 저장할 수 없습니다.',
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
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
