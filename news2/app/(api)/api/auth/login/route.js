import { NextResponse } from 'next/server'

// 임시 사용자 데이터 저장소 (실제로는 데이터베이스 사용)
let users = [
  { email: 'admin@example.com', password: 'admin123', name: '관리자', role: 'admin' },
  { email: 'user@example.com', password: 'user123', name: '사용자', role: 'user' }
]

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    // 필수 필드 검증
    if (!email || !password) {
      return NextResponse.json(
        { message: '이메일과 비밀번호를 입력해주세요.' }, 
        { status: 400 }
      )
    }

    // 사용자 찾기
    const user = users.find(u => u.email === email)

    if (!user) {
      return NextResponse.json(
        { message: '등록되지 않은 이메일 주소입니다.' }, 
        { status: 401 }
      )
    }

    // 비밀번호 검증
    if (user.password !== password) {
      return NextResponse.json(
        { message: '비밀번호가 올바르지 않습니다.' }, 
        { status: 401 }
      )
    }

    console.log('✅ 로그인 성공:', { email, name: user.name, role: user.role })

    return NextResponse.json(
      { 
        message: '로그인이 완료되었습니다!',
        user: {
          email: user.email,
          name: user.name,
          role: user.role
        }
      }, 
      { status: 200 }
    )
    
  } catch (error) {
    console.error('로그인 API 오류:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, 
      { status: 500 }
    )
  }
} 