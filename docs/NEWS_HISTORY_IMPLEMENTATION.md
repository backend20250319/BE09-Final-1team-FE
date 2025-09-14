# 뉴스 읽기 기록 저장 기능 구현 및 오류 수정 과정

## 개요

사용자가 뉴스 상세 페이지에 접속할 때마다 해당 뉴스의 조회 기록을 데이터베이스에 저장하는 기능을 구현했습니다.

## 구현 목표

- 뉴스 상세 페이지 접속 시 자동으로 조회 기록 저장
- API 엔드포인트: `POST http://localhost:8000/api/users/mypage/history/{newsId}`
- 인증된 사용자만 기록 저장 가능

## 구현 과정

### 1. 초기 구현 (lib/newsService.js)

```javascript
// authenticatedFetch import 추가
import { authenticatedFetch } from "./auth";

// recordNewsView 메소드 추가
async recordNewsView(newsId) {
  if (!newsId) {
    console.warn("newsId is required to record news view");
    return;
  }

  try {
    const apiUrl = getApiUrl();
    const response = await authenticatedFetch(
      `${apiUrl}/api/users/mypage/history/${newsId}`,
      {
        method: "POST",
      }
    );

    if (response.ok) {
      console.log(`Successfully recorded view for news ${newsId}`);
      return await response.json();
    } else if (response.status !== 401) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "조회 기록 저장에 실패했습니다." }));
      console.error(
        `Failed to record view for news ${newsId}:`,
        errorData.message
      );
    }
  } catch (error) {
    console.error("Error recording news view:", error);
  }
}

// getNewsById 메소드에서 recordNewsView 호출 추가
async getNewsById(id) {
  // ... 기존 코드 ...

  // 사용자가 뉴스를 조회했으므로, 조회 기록을 서버에 보냅니다.
  this.recordNewsView(id).catch((err) => {
    console.error("Failed to record news view in background:", err);
  });

  return newsItem;
}
```

### 2. 문제 발견: API 호출이 이루어지지 않음

- **증상**: 콘솔이나 네트워크 탭에서 API 요청 흔적을 찾을 수 없음
- **원인**: 뉴스 상세 페이지에서 `newsService.getNewsById()` 함수를 사용하지 않고 직접 `fetch`를 사용하고 있었음

### 3. 문제 해결: 뉴스 상세 페이지에서 직접 호출

```javascript
// app/(news)/news/[id]/page.jsx

// newsService import 추가
import { newsService } from "@/lib/newsService";

// loadNewsData 함수에서 조회 기록 저장 로직 추가
const loadNewsData = async () => {
  try {
    // ... 기존 뉴스 데이터 로딩 코드 ...

    setNewsData(transformedData);
    setError(null);

    // 실제 데이터 로드 완료 알림
    console.log("✅ 뉴스 데이터 로드 완료");

    // 사용자가 뉴스를 조회했으므로, 조회 기록을 서버에 저장합니다.
    try {
      await newsService.recordNewsView(articleId);
      console.log("📝 뉴스 조회 기록이 저장되었습니다.");
    } catch (viewError) {
      console.error("❌ 뉴스 조회 기록 저장 실패:", viewError);
      // 조회 기록 저장 실패는 전체 페이지 로딩에 영향을 주지 않도록 합니다.
    }
  } catch (err) {
    // ... 에러 처리 ...
  }
};
```

### 4. 두 번째 문제 발견: getApiUrl 함수 오류

- **증상**: `TypeError: Cannot read properties of undefined (reading 'replace')`
- **원인**: `getApiUrl()` 함수를 매개변수 없이 호출했지만, 함수는 `endpoint` 매개변수를 필요로 함
- **에러 위치**: `lib/config.js:35:36`에서 `endpoint.replace(/^\//, "")`를 실행할 때 `undefined.replace()` 호출

### 5. 최종 해결: config 직접 사용

```javascript
// lib/newsService.js

// import 수정
import { config } from "./config";  // getApiUrl 대신 config 직접 import

// recordNewsView 함수 수정
async recordNewsView(newsId) {
  if (!newsId) {
    console.warn("newsId is required to record news view");
    return;
  }

  try {
    const apiUrl = config.api.baseUrl;  // 직접 baseUrl 사용
    const fullUrl = `${apiUrl}/api/users/mypage/history/${newsId}`;
    console.log(`🔄 뉴스 조회 기록 저장 요청:`, fullUrl);

    const response = await authenticatedFetch(fullUrl, {
      method: "POST",
    });

    console.log(`📡 API 응답 상태:`, response.status, response.statusText);

    if (response.ok) {
      const responseData = await response.json();
      console.log(`✅ 뉴스 조회 기록 저장 성공:`, responseData);
      console.log(`Successfully recorded view for news ${newsId}`);
      return responseData;
    } else if (response.status !== 401) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "조회 기록 저장에 실패했습니다." }));
      console.error(`❌ API 응답 오류 [${response.status}]:`, errorData);
      console.error(
        `Failed to record view for news ${newsId}:`,
        errorData.message
      );
    }
  } catch (error) {
    console.error("Error recording news view:", error);
  }
}
```

## 디버깅을 위한 로깅 추가

상세한 디버깅을 위해 다음 로그 메시지들을 추가했습니다:

1. `🔄 뉴스 조회 기록 저장 요청: [URL]` - 요청 URL 확인
2. `📡 API 응답 상태: [상태코드] [상태메시지]` - HTTP 응답 상태 확인
3. `✅ 뉴스 조회 기록 저장 성공: [응답데이터]` - 성공 시 백엔드 응답 데이터
4. `❌ API 응답 오류: [에러데이터]` - 실패 시 상세 에러 정보

## 최종 결과

- ✅ 뉴스 상세 페이지 접속 시 조회 기록이 자동으로 저장됨
- ✅ 인증된 사용자만 기록 저장 가능
- ✅ 조회 기록 저장 실패가 전체 페이지 로딩에 영향을 주지 않음
- ✅ 상세한 디버깅 로그를 통해 문제 상황 추적 가능

## 학습한 교훈

1. **함수 시그니처 확인**: 외부 함수를 호출할 때는 항상 매개변수 요구사항을 확인해야 함
2. **직접 의존성**: 헬퍼 함수보다 직접적인 config 사용이 더 안전할 수 있음
3. **에러 처리**: 부수적인 기능(조회 기록)이 주요 기능(페이지 로딩)에 영향을 주지 않도록 적절한 에러 처리 필요
4. **단계적 디버깅**: 상세한 로깅을 통해 문제 발생 지점을 정확히 파악할 수 있음

## 파일 변경 사항

- `lib/newsService.js`: recordNewsView 메소드 추가, import 수정, 상세 로깅 추가
- `app/(news)/news/[id]/page.jsx`: newsService import 및 recordNewsView 호출 추가

## API 엔드포인트

- **URL**: `POST {baseUrl}/api/users/mypage/history/{newsId}`
- **인증**: Bearer Token 필요
- **응답**: JSON 형태의 성공/실패 메시지
