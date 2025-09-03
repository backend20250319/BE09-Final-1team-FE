// 뉴스레터 구독 API
export async function POST(request) {
  try {
    const body = await request.json()
    const { email, frequency, preferredCategories } = body
    const authHeader = request.headers.get('authorization')

    if (!email || !preferredCategories) {
      return Response.json(
        { success: false, error: '이메일과 선호 카테고리가 필요합니다.' },
        { status: 400 }
      )
    }

    // 기존 구독 정보 확인
    let existingSubscriptions = []
    if (authHeader) {
      try {
        const subscriptionsResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscription/my`, {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          }
        })

        if (subscriptionsResponse.ok) {
          const subscriptionsData = await subscriptionsResponse.json()
          if (subscriptionsData.success && subscriptionsData.data) {
            existingSubscriptions = subscriptionsData.data
          }
        }
      } catch (error) {
        console.warn('기존 구독 정보 조회 실패:', error)
      }
    }

    // 기존 구독에서 카테고리 수집
    const existingCategories = []
    existingSubscriptions.forEach(sub => {
      if (sub.preferredCategories && Array.isArray(sub.preferredCategories)) {
        existingCategories.push(...sub.preferredCategories)
      }
    })

    // 중복 제거
    const uniqueExistingCategories = [...new Set(existingCategories)]
    
    // 새로 구독할 카테고리들
    const newCategories = Array.isArray(preferredCategories) ? preferredCategories : [preferredCategories]
    
    // 이미 구독 중인 카테고리 필터링
    const categoriesToAdd = newCategories.filter(cat => !uniqueExistingCategories.includes(cat))
    
    // 최대 3개 제한 확인
    const totalCategories = uniqueExistingCategories.length + categoriesToAdd.length
    
    if (totalCategories > 3) {
      return Response.json(
        { 
          success: false,
          error: '최대 3개 카테고리까지 구독할 수 있습니다. 다른 카테고리 구독을 해제한 후 다시 시도해주세요.'
        },
        { status: 400 }
      )
    }

    // 기존 구독이 있으면 업데이트, 없으면 새로 생성
    if (existingSubscriptions.length > 0) {
      // 기존 구독에 새로운 카테고리 추가
      const updatedCategories = [...uniqueExistingCategories, ...categoriesToAdd]
      
      // 기존 구독을 모두 삭제하고 새로운 구독으로 대체
      for (const existingSub of existingSubscriptions) {
        try {
          await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscription/${existingSub.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json',
            }
          })
        } catch (error) {
          console.warn('기존 구독 삭제 실패:', error)
        }
      }
      
      // 새로운 구독 생성 (모든 카테고리 포함)
      const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { 'Authorization': authHeader })
        },
        body: JSON.stringify({
          email,
          frequency: frequency || 'DAILY',
          preferredCategories: updatedCategories
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return Response.json(data)
    } else {
      // 새로운 구독 생성
      const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { 'Authorization': authHeader })
        },
        body: JSON.stringify({
          email,
          frequency: frequency || 'DAILY',
          preferredCategories: categoriesToAdd
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return Response.json(data)
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('뉴스레터 구독 실패:', error)
    return Response.json(
      { 
        success: false,
        error: '뉴스레터 구독에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
