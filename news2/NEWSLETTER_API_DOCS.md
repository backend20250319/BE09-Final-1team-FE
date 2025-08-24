# 뉴스레터 API 문서

## 개요
이 문서는 뉴스레터 구독 관리 기능의 API 엔드포인트들을 설명합니다. 모든 API는 백엔드 서비스(`http://localhost:8085`)와 연동됩니다.

## 인증
대부분의 API는 JWT 토큰을 필요로 합니다. 요청 헤더에 다음을 포함하세요:
```
Authorization: Bearer <your-jwt-token>
```

## API 엔드포인트

### 1. 뉴스레터 구독
**POST** `/api/newsletters/subscribe`

뉴스레터를 구독합니다.

**요청 본문:**
```json
{
  "email": "test@example.com",
  "frequency": "DAILY",
  "preferredCategories": ["POLITICS", "ECONOMY"]
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "email": "test@example.com",
    "status": "ACTIVE",
    "frequency": "DAILY",
    "preferredCategories": ["POLITICS", "ECONOMY"]
  }
}
```

### 2. 구독 정보 조회
**GET** `/api/newsletters/subscription/{subscriptionId}`

특정 구독의 정보를 조회합니다.

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "email": "test@example.com",
    "status": "ACTIVE",
    "frequency": "DAILY",
    "preferredCategories": ["POLITICS", "ECONOMY"]
  }
}
```

### 3. 내 구독 목록 조회
**GET** `/api/newsletters/subscription/my`

현재 사용자의 모든 구독 목록을 조회합니다.

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "email": "test@example.com",
      "status": "ACTIVE",
      "frequency": "DAILY",
      "preferredCategories": ["POLITICS", "ECONOMY"]
    }
  ]
}
```

### 4. 구독 해지
**DELETE** `/api/newsletters/subscription/{subscriptionId}`

구독을 해지합니다.

**응답:**
```json
{
  "success": true,
  "data": "구독이 해지되었습니다."
}
```

### 5. 활성 구독 목록 조회
**GET** `/api/newsletters/subscription/active`

현재 사용자의 활성 구독 목록을 조회합니다.

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "email": "test@example.com",
      "status": "ACTIVE",
      "frequency": "DAILY",
      "preferredCategories": ["POLITICS", "ECONOMY"]
    }
  ]
}
```

### 6. 구독 상태 변경
**PUT** `/api/newsletters/subscription/{subscriptionId}/status`

구독 상태를 변경합니다.

**요청 본문:**
```json
{
  "status": "PAUSED"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "email": "test@example.com",
    "status": "PAUSED",
    "frequency": "DAILY",
    "preferredCategories": ["POLITICS", "ECONOMY"]
  },
  "message": "구독 상태가 변경되었습니다."
}
```

## 상태 코드

- `ACTIVE`: 활성 구독
- `PAUSED`: 일시 정지
- `CANCELLED`: 취소됨

## 빈도 옵션

- `DAILY`: 매일
- `WEEKLY`: 주간
- `MONTHLY`: 월간

## 카테고리 매핑

프론트엔드에서 백엔드로 전송할 때 카테고리가 자동으로 매핑됩니다:

| 프론트엔드 | 백엔드 |
|-----------|--------|
| 정치 | POLITICS |
| 경제 | ECONOMY |
| 사회 | SOCIETY |
| 생활 | LIFE |
| 세계 | INTERNATIONAL |
| IT/과학 | IT_SCIENCE |
| 자동차/교통 | VEHICLE |
| 여행/음식 | TRAVEL_FOOD |
| 예술 | ART |

## 에러 응답

모든 API는 에러 발생 시 다음과 같은 형식으로 응답합니다:

```json
{
  "success": false,
  "error": "에러 메시지",
  "details": "상세 에러 정보"
}
```

## 사용 예시

### cURL 예시

```bash
# 뉴스레터 구독
curl -X POST http://localhost:3000/api/newsletters/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","frequency":"DAILY","preferredCategories":["POLITICS","ECONOMY"]}'

# 내 구독 목록 조회
curl -X GET http://localhost:3000/api/newsletters/subscription/my \
  -H "Authorization: Bearer your-jwt-token"

# 구독 해지
curl -X DELETE http://localhost:3000/api/newsletters/subscription/1 \
  -H "Authorization: Bearer your-jwt-token"

# 구독 상태 변경
curl -X PUT http://localhost:3000/api/newsletters/subscription/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"status":"PAUSED"}'
```

## React Query 훅 사용

프론트엔드에서는 다음과 같은 훅들을 사용할 수 있습니다:

```javascript
import { 
  useNewsletters, 
  useUserSubscriptions, 
  useSubscribeNewsletter, 
  useUnsubscribeNewsletter,
  useSubscription,
  useMySubscriptions,
  useActiveSubscriptions,
  useUpdateSubscriptionStatus
} from '@/hooks/useNewsletter'

// 뉴스레터 목록 조회
const { data: newsletters, isLoading } = useNewsletters()

// 사용자 구독 목록 조회
const { data: subscriptions } = useUserSubscriptions({ enabled: !!userRole })

// 구독하기
const subscribeMutation = useSubscribeNewsletter()
subscribeMutation.mutate({ category: '정치', email: 'test@example.com' })

// 구독 해제
const unsubscribeMutation = useUnsubscribeNewsletter()
unsubscribeMutation.mutate(subscriptionId)

// 구독 상태 변경
const updateStatusMutation = useUpdateSubscriptionStatus()
updateStatusMutation.mutate({ subscriptionId: 1, status: 'PAUSED' })
```
