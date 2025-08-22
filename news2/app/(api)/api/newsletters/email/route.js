import { newsletterContentService } from '@/lib/services/NewsletterContentService'
import { emailRenderer } from '@/lib/renderers/EmailRenderer'

/**
 * 뉴스레터 이메일 HTML 생성 API
 * 뉴스레터 콘텐츠를 이메일-safe HTML로 렌더링
 */
export async function POST(request) {
  try {
    const body = await request.json()
    
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
    } = body

    // 입력 검증
    if (personalized && !userId) {
      return Response.json(
        { error: '개인화된 뉴스레터를 위해서는 userId가 필요합니다.' },
        { status: 400 }
      )
    }

    // 뉴스레터 콘텐츠 생성
    let content

    if (personalized && userId) {
      content = await newsletterContentService.buildPersonalizedContent(
        newsletterId,
        userId,
        {
          category,
          limit,
          includeTrending,
          includeLatest
        }
      )
    } else {
      content = await newsletterContentService.buildContent(
        newsletterId,
        {
          personalized,
          userId,
          category,
          limit
        }
      )
    }

    // 이메일 렌더링
    let emailContent
    let contentType

    if (format === 'text') {
      emailContent = emailRenderer.renderTextVersion(content)
      contentType = 'text/plain; charset=utf-8'
    } else {
      emailContent = emailRenderer.renderNewsletter(content, {
        includeTracking,
        includeUnsubscribe,
        theme
      })
      contentType = 'text/html; charset=utf-8'
    }

    // HTML 또는 텍스트 형태로 반환
    return new Response(emailContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('❌ 뉴스레터 이메일 생성 실패:', error)
    
    return Response.json(
      { 
        error: '뉴스레터 이메일 생성에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * 뉴스레터 이메일 미리보기 API
 * GET 요청으로 뉴스레터 이메일 HTML을 생성하고 반환
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 쿼리 파라미터 파싱
    const newsletterId = searchParams.get('id') || Date.now()
    const category = searchParams.get('category')
    const personalized = searchParams.get('personalized') === 'true'
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit')) || 5
    const includeTracking = searchParams.get('tracking') !== 'false'
    const includeUnsubscribe = searchParams.get('unsubscribe') !== 'false'
    const theme = searchParams.get('theme') || 'default'
    const format = searchParams.get('format') || 'html'

    // 입력 검증
    if (personalized && !userId) {
      return Response.json(
        { error: '개인화된 뉴스레터를 위해서는 userId가 필요합니다.' },
        { status: 400 }
      )
    }

    // 뉴스레터 콘텐츠 생성
    let content

    if (personalized && userId) {
      content = await newsletterContentService.buildPersonalizedContent(
        newsletterId,
        userId,
        {
          category,
          limit,
          includeTrending: true,
          includeLatest: true
        }
      )
    } else {
      content = await newsletterContentService.buildContent(
        newsletterId,
        {
          personalized,
          userId,
          category,
          limit
        }
      )
    }

    // 이메일 렌더링
    let emailContent
    let contentType

    if (format === 'text') {
      emailContent = emailRenderer.renderTextVersion(content)
      contentType = 'text/plain; charset=utf-8'
    } else {
      emailContent = emailRenderer.renderNewsletter(content, {
        includeTracking,
        includeUnsubscribe,
        theme
      })
      contentType = 'text/html; charset=utf-8'
    }

    // HTML 또는 텍스트 형태로 반환
    return new Response(emailContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('❌ 뉴스레터 이메일 미리보기 실패:', error)
    
    return Response.json(
      { 
        error: '뉴스레터 이메일 미리보기에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
