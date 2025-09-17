# 카카오 SDK 오류 해결 가이드

## 🚨 발생한 오류

```
Error at https://developers.kakao.com/sdk/js/kakao.js:1376:26
```

이 오류는 카카오 SDK 로드 및 초기화 과정에서 발생하는 문제입니다.

## ✅ 해결된 사항

### 1. SDK 로드 방식 개선
- **기존**: `https://developers.kakao.com/sdk/js/kakao.js` (불안정)
- **개선**: `https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js` (안정적)
- **추가**: integrity, crossOrigin 속성으로 보안 강화

### 2. 중복 로드 방지
- `window.kakaoSDKLoading` 플래그로 중복 로드 방지
- 이미 로드 중인 경우 대기 메커니즘 추가

### 3. 초기화 안전성 강화
- 환경변수 유효성 검사
- SDK 초기화 상태 확인
- 에러 처리 개선

### 4. 함수 안전성 강화
- 모든 공유 함수에 안전성 검사 추가
- 데이터 유효성 검사
- 상세한 에러 메시지 제공

## 🔧 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하세요:

```env
# 카카오 JavaScript 키 (필수)
NEXT_PUBLIC_KAKAO_JS_KEY=your_javascript_key_here

# 카카오 템플릿 ID (선택사항)
NEXT_PUBLIC_KAKAO_TEMPLATE_ID=123798

# 카카오 리다이렉트 URI (친구에게 보내기용)
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/auth/oauth/kakao
```

## 🎯 카카오 개발자 콘솔 설정

### 1. JavaScript 키 확인
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. **앱 설정 > 일반**에서 JavaScript 키 복사
3. `.env.local` 파일에 설정

### 2. 플랫폼 설정
1. **앱 설정 > 플랫폼**에서 Web 플랫폼 추가
2. 사이트 도메인 등록:
   - 개발: `http://localhost:3000`
   - 운영: `https://yourdomain.com`

### 3. 카카오 로그인 설정
1. **제품 설정 > 카카오 로그인** 활성화
2. **Redirect URI** 설정:
   - `http://localhost:3000/auth/oauth/kakao`

## 🧪 테스트 방법

### 1. 개발 환경에서 테스트
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
# 1. 콘솔에서 "카카오 SDK 초기화 완료" 메시지 확인
# 2. 공유 버튼 클릭 테스트
# 3. 에러 메시지 확인
```

### 2. 환경변수 확인
```javascript
// 브라우저 콘솔에서 확인
console.log('KAKAO_JS_KEY:', process.env.NEXT_PUBLIC_KAKAO_JS_KEY)
```

## 🔍 디버깅 팁

### 1. 콘솔 로그 확인
```javascript
// 정상적인 로그
"카카오 SDK 초기화 완료"
"뉴스레터 공유 데이터: {...}"
"템플릿 인자: {...}"

// 오류 로그
"카카오 JavaScript 키가 설정되지 않았습니다"
"카카오 SDK 로드/초기화 실패: ..."
```

### 2. 네트워크 탭 확인
- 카카오 SDK 스크립트 로드 상태 확인
- 404 오류나 CORS 오류 확인

### 3. 환경변수 확인
```bash
# .env.local 파일 존재 확인
ls -la .env.local

# 환경변수 내용 확인
cat .env.local
```

## 🚀 배포 시 주의사항

### 1. 환경변수 설정
- 운영 환경에서도 동일한 환경변수 설정
- 실제 도메인으로 플랫폼 설정 업데이트

### 2. 도메인 등록
- 카카오 개발자 콘솔에서 운영 도메인 등록
- HTTPS 사용 권장

### 3. 템플릿 ID 확인
- 운영 환경에서 사용할 템플릿 ID 확인
- 템플릿 승인 상태 확인

## 📱 모바일 테스트

### 1. 모바일 브라우저에서 테스트
- iOS Safari
- Android Chrome
- 카카오톡 인앱 브라우저

### 2. 카카오톡 앱 연동 테스트
- 카카오톡 앱 설치 상태 확인
- 공유 후 카카오톡 앱 실행 확인

## 🎉 완료!

이제 카카오 SDK 오류가 해결되었습니다!

### 주요 개선사항:
- ✅ 안정적인 SDK 로드 방식
- ✅ 중복 로드 방지
- ✅ 강화된 에러 처리
- ✅ 상세한 디버깅 정보
- ✅ 환경변수 유효성 검사

### 다음 단계:
1. 환경변수 설정
2. 카카오 개발자 콘솔 설정
3. 기능 테스트
4. 사용자 피드백 수집
