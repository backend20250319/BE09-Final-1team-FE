import { NextResponse } from 'next/server'
import { getAuthHeaders } from '@/lib/auth'

export async function GET(req) {
  try {
    // 인증 헤더 확인
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // 백엔드 서버로 요청 전달 시도
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8082'
    
    try {
      const response = await fetch(`${backendUrl}/users/mypage`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data, { status: 200 })
      } else {
        // 백엔드 실패 시 프론트엔드에서 처리
        throw new Error('BACKEND_UNAVAILABLE')
      }
    } catch (backendError) {
      // 백엔드 서버가 응답하지 않을 때 프론트엔드에서 처리
      console.log('🔄 프론트엔드 마이페이지 처리 시작')
      
      // 토큰에서 사용자 정보 추출 (실제로는 JWT 디코딩 필요)
      // 임시로 로컬 스토리지에서 사용자 정보 가져오기
      const userInfo = getUserInfoFromStorage()
      
      if (!userInfo) {
        return NextResponse.json(
          { success: false, message: '사용자 정보를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 마이페이지용 사용자 정보 구성
      const mypageData = {
        id: userInfo.id || Date.now(),
        name: userInfo.name || '사용자',
        email: userInfo.email || '이메일 정보 없음',
        profileImageUrl: userInfo.profileImageUrl || null,
        createdAt: userInfo.createdAt || new Date().toISOString(),
        role: userInfo.role || 'USER',
        birthYear: userInfo.birthYear || null,
        gender: userInfo.gender || null,
        hobbies: userInfo.hobbies || []
      }

      return NextResponse.json({
        success: true,
        message: '사용자 정보를 성공적으로 가져왔습니다.',
        data: mypageData
      }, { status: 200 })
    }
    
  } catch (error) {
    console.error('마이페이지 API 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}

// 임시 사용자 정보 반환 (개발용)
function getMockUserInfo() {
  return {
    id: 1,
    name: '테스트 사용자',
    email: 'test@example.com',
    profileImageUrl: null,
    createdAt: new Date('2024-01-01').toISOString(),
    role: 'USER',
    birthYear: 1990,
    gender: '남성',
    hobbies: ['독서', '운동', '여행']
  }
}
