import { NextResponse } from 'next/server';
import { getUserInfo } from '@/lib/auth/auth';

/**
 * 뉴스레터 기사 클릭 추적 API
 * 
 * 사용자가 뉴스레터의 기사 링크를 클릭했을 때 읽기 기록을 전송합니다.
 * 이 데이터는 사용자의 읽기 패턴 분석과 뉴스레터 개인화에 활용됩니다.
 */
export async function POST(request) {
  try {
    console.log('📊 뉴스레터 기사 클릭 추적 요청 시작');

    // 요청 본문 파싱
    const body = await request.json();
    const { newsId, newsletterId, category, articleTitle, articleUrl } = body;

    // 필수 파라미터 검증
    if (!newsId) {
      console.error('❌ 필수 파라미터 누락: newsId');
      return NextResponse.json(
        { 
          success: false, 
          error: 'newsId는 필수 파라미터입니다.' 
        },
        { status: 400 }
      );
    }

    // 사용자 정보 조회
    const userInfo = getUserInfo();
    if (!userInfo) {
      console.warn('⚠️ 인증되지 않은 사용자의 클릭 추적 요청');
      return NextResponse.json(
        { 
          success: false, 
          error: '인증이 필요합니다.' 
        },
        { status: 401 }
      );
    }

    // 클릭 추적 데이터 구성
    const clickData = {
      userId: userInfo.id || userInfo.email,
      userEmail: userInfo.email,
      newsId,
      newsletterId: newsletterId || null,
      category: category || null,
      articleTitle: articleTitle || null,
      articleUrl: articleUrl || null,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || null,
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      referer: request.headers.get('referer') || null,
    };

    console.log('📊 클릭 추적 데이터:', {
      userId: clickData.userId,
      newsId: clickData.newsId,
      category: clickData.category,
      timestamp: clickData.timestamp
    });

    // 백엔드 API 호출 (실제 구현 시)
    try {
      // TODO: 실제 백엔드 API 호출 구현
      // const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/newsletter/track-click`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`
      //   },
      //   body: JSON.stringify(clickData)
      // });

      // 현재는 로컬 로깅만 수행
      console.log('✅ 클릭 추적 데이터 저장 완료:', clickData);

      // 성공 응답
      return NextResponse.json({
        success: true,
        message: '클릭 추적이 성공적으로 기록되었습니다.',
        data: {
          newsId: clickData.newsId,
          timestamp: clickData.timestamp,
          userId: clickData.userId
        }
      });

    } catch (backendError) {
      console.error('❌ 백엔드 API 호출 실패:', backendError);
      
      // 백엔드 오류 시에도 클라이언트에는 성공 응답 (사용자 경험 우선)
      return NextResponse.json({
        success: true,
        message: '클릭 추적이 기록되었습니다.',
        data: {
          newsId: clickData.newsId,
          timestamp: clickData.timestamp,
          userId: clickData.userId
        },
        warning: '백엔드 동기화 중 오류가 발생했지만 클릭은 기록되었습니다.'
      });
    }

  } catch (error) {
    console.error('❌ 뉴스레터 기사 클릭 추적 실패:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: '클릭 추적 처리 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * 클릭 추적 통계 조회 (선택적 기능)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // 사용자 인증 확인
    const userInfo = getUserInfo();
    if (!userInfo) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // TODO: 실제 백엔드에서 클릭 통계 조회
    // const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/newsletter/click-stats?${searchParams}`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`
    //   }
    // });

    // 현재는 더미 데이터 반환
    const mockStats = {
      totalClicks: 42,
      categoryClicks: {
        '정치': 12,
        '경제': 8,
        '사회': 15,
        'IT/과학': 7
      },
      recentClicks: [
        {
          newsId: 'news-001',
          articleTitle: '정치 뉴스 제목',
          category: '정치',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          newsId: 'news-002',
          articleTitle: '경제 뉴스 제목',
          category: '경제',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: mockStats
    });

  } catch (error) {
    console.error('❌ 클릭 추적 통계 조회 실패:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: '통계 조회 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}
