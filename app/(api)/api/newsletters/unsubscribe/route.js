// 뉴스레터 구독 해제 API (카테고리 기반)
export async function POST(request) {
  try {
    console.log('🚀 구독 해제 API 시작')
    
    const body = await request.json()
    console.log('📥 요청 본문:', body)
    
    const { category } = body
    const authHeader = request.headers.get('authorization')

    console.log('🔍 파싱된 데이터:', { category, hasAuth: !!authHeader })

    if (!category) {
      console.log('❌ 카테고리 누락')
      return Response.json(
        { success: false, error: '카테고리가 필요합니다.' },
        { status: 400 }
      )
    }

    if (!authHeader) {
      console.log('❌ 인증 헤더 누락')
      return Response.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    console.log('🔍 구독 해제 API 호출:', { category })

    // 카테고리 매핑 (프론트엔드 → 백엔드)
    const categoryMapping = {
      '정치': 'POLITICS',
      '경제': 'ECONOMY', 
      '사회': 'SOCIETY',
      '생활': 'LIFE',
      '세계': 'INTERNATIONAL',
      'IT/과학': 'IT_SCIENCE',
      '자동차/교통': 'VEHICLE',
      '여행/음식': 'TRAVEL_FOOD',
      '예술': 'ART'
    }

    const backendCategory = categoryMapping[category]
    if (!backendCategory) {
      return Response.json(
        { success: false, error: '지원하지 않는 카테고리입니다.' },
        { status: 400 }
      )
    }

    // 먼저 사용자의 구독 정보를 가져와서 해당 카테고리가 포함된 구독을 찾음
    const subscriptionsResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscription/my`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      }
    })

    if (!subscriptionsResponse.ok) {
      const errorText = await subscriptionsResponse.text()
      console.error('❌ 구독 정보 조회 실패:', { 
        status: subscriptionsResponse.status, 
        statusText: subscriptionsResponse.statusText,
        errorText 
      })
      throw new Error(`구독 정보 조회 실패: ${subscriptionsResponse.status} - ${errorText}`)
    }

    const subscriptionsData = await subscriptionsResponse.json()
    console.log('📋 사용자 구독 정보:', subscriptionsData)

    // user-subscriptions API는 배열을 직접 반환하므로 data 필드가 없음
    const subscriptions = Array.isArray(subscriptionsData) ? subscriptionsData : (subscriptionsData.data || [])
    console.log('📋 처리된 구독 데이터:', subscriptions)

    if (!subscriptions || subscriptions.length === 0) {
      console.log('❌ 구독 정보 없음')
      return Response.json(
        { success: false, error: '구독 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log('🔍 구독 중인 카테고리들:', subscriptions.map(sub => sub.preferredCategories))

    // 해당 카테고리가 포함된 구독 찾기
    const targetSubscription = subscriptions.find(sub => {
      if (sub.preferredCategories && Array.isArray(sub.preferredCategories)) {
        const hasCategory = sub.preferredCategories.includes(backendCategory)
        console.log(`🔍 구독 ${sub.id}: ${sub.preferredCategories}에 ${backendCategory} 포함? ${hasCategory}`)
        return hasCategory
      }
      return false
    })

    if (!targetSubscription) {
      return Response.json(
        { success: false, error: '해당 카테고리의 구독을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log('✅ 찾은 구독:', targetSubscription)

    // 해당 구독의 카테고리에서 제거할 카테고리 빼기
    const remainingCategories = targetSubscription.preferredCategories.filter(cat => cat !== backendCategory)

    // 최소 1개 구독 유지 제한
    if (remainingCategories.length === 0) {
      return Response.json(
        { success: false, error: '최소 1개의 카테고리는 구독해야 합니다.' },
        { status: 400 }
      )
    }

    // 구독 업데이트 요청
    const updateRequestBody = {
      email: targetSubscription.email,
      frequency: targetSubscription.frequency,
      preferredCategories: remainingCategories
    }

    console.log('🔄 구독 업데이트 요청:', updateRequestBody)
    console.log('🔄 백엔드 URL:', `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscribe`)

    const updateResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateRequestBody)
    })

    console.log('📡 업데이트 응답 상태:', updateResponse.status, updateResponse.statusText)

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text()
      console.error('❌ 구독 업데이트 실패:', { 
        status: updateResponse.status, 
        statusText: updateResponse.statusText,
        errorText 
      })
      throw new Error(`구독 업데이트 실패: ${updateResponse.status} - ${errorText}`)
    }

    const result = await updateResponse.json()
    console.log('✅ 구독 해제 성공:', result)

    return Response.json({
      success: true,
      message: `${category} 카테고리 구독이 해제되었습니다.`,
      data: result
    })

  } catch (error) {
    console.error('❌ 뉴스레터 구독 해제 실패:', error)
    return Response.json(
      { 
        success: false,
        error: '뉴스레터 구독 해제에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
