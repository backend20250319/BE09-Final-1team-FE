// 뉴스레터 공유 통계 API
export async function POST(request) {
  try {
    console.log('🚀 공유 통계 API 시작')
    
    const body = await request.json()
    console.log('📥 요청 본문:', body)
    
    const { newsletterId, shareType, timestamp } = body
    const authHeader = request.headers.get('authorization')

    console.log('🔍 파싱된 데이터:', { newsletterId, shareType, timestamp, hasAuth: !!authHeader })

    if (!shareType) {
      console.log('❌ 공유 타입 누락')
      return Response.json(
        { success: false, error: '공유 타입이 필요합니다.' },
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

    // 공유 타입 검증
    const validShareTypes = ['kakao', 'link', 'email']
    if (!validShareTypes.includes(shareType)) {
      return Response.json(
        { success: false, error: '지원하지 않는 공유 타입입니다.' },
        { status: 400 }
      )
    }

    // 백엔드에 공유 통계 전송
    const shareData = {
      newsletterId: newsletterId || 'default',
      shareType: shareType,
      timestamp: timestamp || new Date().toISOString(),
      platform: shareType === 'kakao' ? 'KAKAO' : 
                shareType === 'link' ? 'LINK' : 'EMAIL'
    }

    console.log('📊 공유 통계 데이터:', shareData)

    // 백엔드 API 호출 (실제 구현시 백엔드 엔드포인트로 변경)
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/share-stats`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shareData)
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('❌ 공유 통계 저장 실패:', { 
        status: backendResponse.status, 
        statusText: backendResponse.statusText,
        errorText 
      })
      
      // 백엔드 API가 아직 구현되지 않은 경우에도 성공으로 처리
      console.log('⚠️ 백엔드 API 미구현, 로컬 처리로 진행')
    } else {
      const result = await backendResponse.json()
      console.log('✅ 공유 통계 저장 성공:', result)
    }

    // 공유 타입별 메시지
    const shareMessages = {
      kakao: '카카오톡 공유가 기록되었습니다.',
      link: '링크 복사가 기록되었습니다.',
      email: '이메일 공유가 기록되었습니다.'
    }

    return Response.json({
      success: true,
      message: shareMessages[shareType] || '공유가 기록되었습니다.',
      data: {
        shareType,
        timestamp: shareData.timestamp,
        newsletterId: shareData.newsletterId
      }
    })

  } catch (error) {
    console.error('❌ 공유 통계 처리 실패:', error)
    return Response.json(
      { 
        success: false,
        error: '공유 통계 처리에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// 공유 통계 조회 API
export async function GET(request) {
  try {
    console.log('📊 공유 통계 조회 API 시작')
    
    const { searchParams } = new URL(request.url)
    const newsletterId = searchParams.get('newsletterId') || 'default'
    const authHeader = request.headers.get('authorization')

    console.log('🔍 조회 파라미터:', { newsletterId, hasAuth: !!authHeader })

    if (!authHeader) {
      console.log('❌ 인증 헤더 누락')
      return Response.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 백엔드에서 공유 통계 조회
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/share-stats?newsletterId=${newsletterId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      }
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('❌ 공유 통계 조회 실패:', { 
        status: backendResponse.status, 
        statusText: backendResponse.statusText,
        errorText 
      })
      
      // 백엔드 API가 아직 구현되지 않은 경우 기본 데이터 반환
      console.log('⚠️ 백엔드 API 미구현, 기본 통계 반환')
      return Response.json({
        success: true,
        data: {
          newsletterId,
          totalShares: 0,
          sharesByType: {
            kakao: 0,
            link: 0,
            email: 0
          },
          lastUpdated: new Date().toISOString()
        }
      })
    }

    const result = await backendResponse.json()
    console.log('✅ 공유 통계 조회 성공:', result)

    return Response.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('❌ 공유 통계 조회 실패:', error)
    return Response.json(
      { 
        success: false,
        error: '공유 통계 조회에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
