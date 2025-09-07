import { cookies } from 'next/headers';
import NewsletterContentService from '@/lib/services/NewsletterContentService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 쿠키에서 액세스 토큰 가져오기
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    
    // 쿼리 파라미터 파싱
    const newsletterId = searchParams.get('id') || Date.now();
    const category = searchParams.get('category');
    const personalized = searchParams.get('personalized') === 'true';
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit')) || 5;

    // 입력 검증
    if (personalized && !userId) {
      return Response.json(
        {
          code: 'MISSING_USER_ID',
          message: '개인화된 뉴스레터를 위해서는 userId가 필요합니다.',
          details: 'personalized=true일 때 userId는 필수입니다.'
        },
        { status: 400 }
      );
    }

    let content;

    if (personalized && userId) {
      // 개인화된 뉴스레터 콘텐츠 생성 (토큰 전달)
      content = await NewsletterContentService.buildPersonalizedContent(
        newsletterId,
        userId,
        {
          category,
          limit,
          includeTrending: true,
          includeLatest: true
        },
        accessToken // 인증 토큰 전달
      );
    } else {
      // 기본 뉴스레터 콘텐츠 생성 (토큰 전달)
      content = await NewsletterContentService.buildContent(
        newsletterId,
        {
          personalized,
          userId,
          category,
          limit
        },
        accessToken // 인증 토큰 전달
      );
    }

    // 표준화된 응답 반환
    return Response.json({
      success: true,
      data: content.toJSON(),
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "1.0",
        source: "BFF"
      }
    });

  } catch (error) {
    console.error('❌ 뉴스레터 콘텐츠 생성 실패:', error);
    
    return Response.json(
      {
        code: 'CONTENT_GENERATION_FAILED',
        message: '뉴스레터 콘텐츠 생성에 실패했습니다.',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // 쿠키에서 액세스 토큰 가져오기
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    
    const body = await request.json();
    
    const {
      newsletterId = Date.now(),
      category,
      personalized = false,
      userId,
      limit = 5,
      includeTrending = true,
      includeLatest = true
    } = body;

    // 입력 검증
    if (personalized && !userId) {
      return Response.json(
        {
          code: 'MISSING_USER_ID',
          message: '개인화된 뉴스레터를 위해서는 userId가 필요합니다.',
          details: 'personalized=true일 때 userId는 필수입니다.'
        },
        { status: 400 }
      );
    }

    let content;

    if (personalized && userId) {
      // 개인화된 뉴스레터 콘텐츠 생성 (토큰 전달)
      content = await NewsletterContentService.buildPersonalizedContent(
        newsletterId,
        userId,
        {
          category,
          limit,
          includeTrending,
          includeLatest
        },
        accessToken // 인증 토큰 전달
      );
    } else {
      // 기본 뉴스레터 콘텐츠 생성 (토큰 전달)
      content = await NewsletterContentService.buildContent(
        newsletterId,
        {
          personalized,
          userId,
          category,
          limit
        },
        accessToken // 인증 토큰 전달
      );
    }

    // 표준화된 응답 반환
    return Response.json({
      success: true,
      data: content.toJSON(),
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "1.0",
        source: "BFF"
      }
    });

  } catch (error) {
    console.error('❌ 뉴스레터 콘텐츠 생성 실패:', error);
    
    return Response.json(
      {
        code: 'CONTENT_GENERATION_FAILED',
        message: '뉴스레터 콘텐츠 생성에 실패했습니다.',
        details: error.message
      },
      { status: 500 }
    );
  }
}