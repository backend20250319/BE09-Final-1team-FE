import { newsletterContentService } from '@/lib/services/NewsletterContentService'

/**
 * 뉴스레터 콘텐츠 API
 * JSON 형태로 뉴스레터 콘텐츠를 반환
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

    // 입력 검증
    if (personalized && !userId) {
      return Response.json(
        { error: '개인화된 뉴스레터를 위해서는 userId가 필요합니다.' },
        { status: 400 }
      )
    }

    let content

    if (personalized && userId) {
      // 개인화된 뉴스레터 콘텐츠 생성
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
      // 기본 뉴스레터 콘텐츠 생성
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

    // JSON 형태로 반환
    return Response.json({
      success: true,
      data: content.toJSON(),
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "1.0"
      }
    })

  } catch (error) {
    console.error('❌ 뉴스레터 콘텐츠 생성 실패:', error)
    
    return Response.json(
      { 
        error: '뉴스레터 콘텐츠 생성에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * 뉴스레터 콘텐츠 미리보기 API
 * POST 요청으로 뉴스레터 콘텐츠를 생성하고 반환
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
      includeLatest = true
    } = body

    // 입력 검증
    if (personalized && !userId) {
      return Response.json(
        { error: '개인화된 뉴스레터를 위해서는 userId가 필요합니다.' },
        { status: 400 }
      )
    }

    let content

    if (personalized && userId) {
      // 개인화된 뉴스레터 콘텐츠 생성
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
      // 기본 뉴스레터 콘텐츠 생성
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

    // JSON 형태로 반환
    return Response.json({
      success: true,
      data: content.toJSON(),
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "1.0"
      }
    })

  } catch (error) {
    console.error('❌ 뉴스레터 콘텐츠 생성 실패:', error)
    
    return Response.json(
      { 
        error: '뉴스레터 콘텐츠 생성에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
