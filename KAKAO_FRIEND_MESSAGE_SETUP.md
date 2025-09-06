# 카카오톡 친구에게 메시지 보내기 설정 가이드

## 1. 카카오 개발자 콘솔 설정

### 1.1 앱 생성 및 설정
1. [카카오 개발자 콘솔](https://developers.kakao.com/)에 접속
2. 새 애플리케이션 생성 또는 기존 앱 선택
3. **앱 설정 > 일반**에서 다음 정보 확인:
   - JavaScript 키
   - 앱 키

### 1.2 플랫폼 설정
1. **앱 설정 > 플랫폼**에서 Web 플랫폼 추가
2. 사이트 도메인 등록 (예: `http://localhost:3000`, `https://yourdomain.com`)

### 1.3 카카오 로그인 설정
1. **제품 설정 > 카카오 로그인** 활성화
2. **Redirect URI** 설정:
   - `http://localhost:3000/auth/oauth/kakao` (개발용)
   - `https://yourdomain.com/auth/oauth/kakao` (운영용)

### 1.4 동의항목 설정
1. **제품 설정 > 카카오 로그인 > 동의항목**에서 다음 권한 추가:
   - **카카오톡 메시지 전송** (talk_message)
   - **친구 목록** (friends)

### 1.5 카카오톡 메시지 사용 권한 신청
1. **제품 설정 > 카카오톡 메시지** 활성화
2. **사용 권한 신청** 클릭
3. 다음 정보 입력:
   - 서비스명: 뉴스레터 서비스
   - 서비스 목적: 뉴스레터 구독자에게 친구 추천 기능 제공
   - 예상 사용량: 일일 100건 이하
4. 심사 완료 후 사용 가능

## 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
# 카카오 JavaScript 키
NEXT_PUBLIC_KAKAO_JS_KEY=your_javascript_key_here

# 카카오 리다이렉트 URI
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/auth/oauth/kakao

# 카카오 템플릿 ID (선택사항)
NEXT_PUBLIC_KAKAO_TEMPLATE_ID=123798
```

## 3. 카카오 로그인 처리

### 3.1 OAuth 콜백 페이지 생성
`app/auth/oauth/kakao/page.jsx` 파일을 생성하세요:

```jsx
"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function KakaoOAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('카카오 로그인 오류:', error)
      router.push('/auth/unauthorized')
      return
    }

    if (code) {
      // 여기서 서버에 인증 코드를 전송하여 액세스 토큰을 받아오는 로직 구현
      // 또는 클라이언트에서 직접 토큰 처리
      console.log('카카오 인증 코드:', code)
      
      // 로그인 성공 후 원래 페이지로 리다이렉트
      const state = searchParams.get('state')
      if (state === 'sendfriend_newsletter') {
        router.push('/newsletter')
      } else {
        router.push('/')
      }
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>카카오 로그인 처리 중...</p>
      </div>
    </div>
  )
}
```

## 4. 사용 방법

### 4.1 기본 사용법
```jsx
import KakaoFriendMessage from '@/components/KakaoFriendMessage'

function MyComponent() {
  const newsletterData = {
    title: '뉴스레터 제목',
    description: '뉴스레터 설명',
    imageUrl: 'https://example.com/image.jpg'
  }

  return (
    <KakaoFriendMessage 
      newsletterData={newsletterData}
    />
  )
}
```

### 4.2 훅 사용법
```jsx
import { useKakaoShare } from '@/hooks/useKakaoShare'

function MyComponent() {
  const { sendToFriends, loginWithKakao, checkLoginStatus } = useKakaoShare()

  const handleSendToFriends = async () => {
    try {
      const result = await sendToFriends(newsletterData)
      console.log('발송 성공:', result.message)
    } catch (error) {
      console.error('발송 실패:', error)
    }
  }

  return (
    <button onClick={handleSendToFriends}>
      친구에게 보내기
    </button>
  )
}
```

## 5. 주의사항

### 5.1 쿼터 제한
- **일일 쿼터**: 100건 (기본값, 신청 시 증가 가능)
- **월간 쿼터**: 1,000건 (기본값, 신청 시 증가 가능)
- 쿼터 초과 시 메시지 발송 불가

### 5.2 친구 수 제한
- 한 번에 최대 5명의 친구에게 발송 가능
- 친구가 카카오톡을 사용하지 않으면 메시지 수신 불가

### 5.3 도메인 제한
- 등록된 도메인에서만 메시지 발송 가능
- 개발 시 localhost, 운영 시 실제 도메인 등록 필요

### 5.4 권한 관리
- 사용자가 친구 목록 및 메시지 전송 권한을 거부할 수 있음
- 권한이 없으면 친구 선택 피커가 열리지 않음

## 6. 에러 처리

### 6.1 주요 에러 코드
- `-401`: 인증 오류 (재로그인 필요)
- `-402`: 권한 없음 (권한 설정 확인)
- `-403`: 쿼터 초과 (일일/월간 한도 확인)
- `-1`: 사용자 취소 (친구 선택 취소)

### 6.2 디버깅 팁
1. 브라우저 개발자 도구 콘솔에서 에러 메시지 확인
2. 카카오 개발자 콘솔에서 앱 설정 재확인
3. 환경 변수 설정 확인
4. 도메인 등록 상태 확인

## 7. 테스트 방법

### 7.1 개발 환경 테스트
1. `npm run dev`로 개발 서버 실행
2. 뉴스레터 프리뷰 페이지 접속
3. "친구에게 보내기" 버튼 클릭
4. 카카오 로그인 진행
5. 친구 선택 후 메시지 발송

### 7.2 운영 환경 배포
1. 카카오 개발자 콘솔에서 운영 도메인 등록
2. 환경 변수에 운영용 키 설정
3. 배포 후 기능 테스트

이제 친구에게 뉴스레터를 보내는 기능이 완성되었습니다! 🎉
