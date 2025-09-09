import { cookies } from 'next/headers';
import NewsletterContentService from '@/lib/services/NewsletterContentService';
import { emailRenderer } from '@/lib/renderers/EmailRenderer';

/**
 * 뉴스레터 이메일 HTML 생성 API (BFF)
 * 
 * 클라이언트 요청을 받아 백엔드로 프록시하고 이메일 HTML을 생성합니다.
 * - 입력 검증
 * - 백엔드 콘텐츠 생성
 * - 이메일 렌더링
 * - 에러 처리 및 표준화
 */
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
      includeLatest = true,
      includeTracking = true,
      includeUnsubscribe = true,
      theme = 'default',
      format = 'html' // 'html' 또는 'text'
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

    // 뉴스레터 콘텐츠 생성 (토큰 전달)
    let content;

    if (personalized && userId) {
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

    // 이메일 렌더링
    let emailContent;
    let contentType;

    if (format === 'text') {
      emailContent = emailRenderer.renderTextVersion(content);
      contentType = 'text/plain; charset=utf-8';
    } else {
      emailContent = emailRenderer.renderNewsletter(content, {
        includeTracking,
        includeUnsubscribe,
        theme
      });
      contentType = 'text/html; charset=utf-8';
    }

    // HTML 또는 텍스트 형태로 반환 (BFF 헤더 추가)
    return new Response(emailContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Source': 'BFF'
      }
    });

  } catch (error) {
    console.error('❌ 뉴스레터 이메일 생성 실패:', error);
    
    return Response.json(
      { 
        code: 'EMAIL_GENERATION_FAILED',
        message: '뉴스레터 이메일 생성에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * 뉴스레터 이메일 미리보기 API (BFF)
 * GET 요청으로 뉴스레터 이메일 HTML을 생성하고 반환
 */
export async function GET(request) {
  try {
    // 쿠키에서 액세스 토큰 가져오기
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    
    const { searchParams } = new URL(request.url);
    
    // 쿼리 파라미터 파싱
    const newsletterId = searchParams.get('id') || Date.now();
    const category = searchParams.get('category');
    const personalized = searchParams.get('personalized') === 'true';
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit')) || 5;
    const includeTracking = searchParams.get('tracking') !== 'false';
    const includeUnsubscribe = searchParams.get('unsubscribe') !== 'false';
    const theme = searchParams.get('theme') || 'default';
    const format = searchParams.get('format') || 'html';

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

    // 뉴스레터 콘텐츠 생성 (토큰 전달)
    let content;

    if (personalized && userId) {
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

    // 이메일 렌더링
    let emailContent;
    let contentType;

    if (format === 'text') {
      emailContent = emailRenderer.renderTextVersion(content);
      contentType = 'text/plain; charset=utf-8';
    } else {
      emailContent = emailRenderer.renderNewsletter(content, {
        includeTracking,
        includeUnsubscribe,
        theme
      });
      contentType = 'text/html; charset=utf-8';
    }

    // HTML 또는 텍스트 형태로 반환
    return new Response(emailContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('❌ 뉴스레터 이메일 미리보기 실패:', error);
    
    return Response.json(
      { 
        error: '뉴스레터 이메일 미리보기에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}