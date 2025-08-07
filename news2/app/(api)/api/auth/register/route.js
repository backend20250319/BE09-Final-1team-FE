import { NextResponse } from 'next/server'

// 임시 사용자 데이터 저장소 (실제로는 데이터베이스 사용)
let users = [
  { email: 'admin@example.com', password: 'admin123', name: '관리자', role: 'admin' },
  { email: 'user@example.com', password: 'user123', name: '사용자', role: 'user' }
]

export async function POST(req) {
  try {
    const { name, email, password, newsletter } = await req.json()

    // 필수 필드 검증
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: '이름, 이메일, 비밀번호는 필수입니다.' }, 
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: '올바른 이메일 형식이 아닙니다.' }, 
        { status: 400 }
      )
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json(
        { message: '비밀번호는 최소 6자 이상이어야 합니다.' }, 
        { status: 400 }
      )
    }

    // 중복 이메일 체크
    const existingUser = users.find(user => user.email === email)
    if (existingUser) {
      return NextResponse.json(
        { message: '이미 등록된 이메일 주소입니다.' }, 
        { status: 409 }
      )
    }

    // 새 사용자 생성
    const newUser = {
      email,
      password, // 실제로는 해시된 비밀번호 저장
      name,
      role: 'user',
      newsletter: newsletter || false,
      createdAt: new Date().toISOString()
    }

    users.push(newUser)

    console.log('✅ 새 사용자 등록:', { email, name, newsletter })

    return NextResponse.json(
      { 
        message: '회원가입이 완료되었습니다!',
        user: {
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      }, 
      { status: 201 }
    )
    
  } catch (error) {
    console.error('회원가입 API 오류:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, 
      { status: 500 }
    )
  }
} 