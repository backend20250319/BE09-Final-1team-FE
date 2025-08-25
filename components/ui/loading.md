# Loading 컴포넌트 사용 가이드

## 개요
Loading 상태를 용도별로 구분하여 재사용 가능한 컴포넌트들을 제공합니다.

## 컴포넌트 종류

### 1. Spinner (스피너)
단순한 처리 중 표시용
```jsx
import { Spinner } from '@/components/ui/loading'

// 기본 사용
<Spinner />

// 크기와 색상 커스터마이징
<Spinner size="lg" color="white" />
```

### 2. LoadingButton (로딩 버튼)
버튼 클릭 시 처리 중 상태
```jsx
import { LoadingButton } from '@/components/ui/loading'

<LoadingButton 
  loading={isLoading}
  loadingText="처리 중..."
  onClick={handleSubmit}
>
  제출하기
</LoadingButton>
```

### 3. LoadingOverlay (로딩 오버레이)
전체 화면 로딩
```jsx
import { LoadingOverlay } from '@/components/ui/loading'

<LoadingOverlay 
  visible={isLoading}
  text="데이터를 불러오는 중..."
/>
```

### 4. 스켈레톤 컴포넌트들
레이아웃 구조를 보여주는 로딩 상태

#### CardLoadingSkeleton (카드 레이아웃)
```jsx
import { CardLoadingSkeleton } from '@/components/ui/loading'

<CardLoadingSkeleton />
```

#### TextLoadingSkeleton (텍스트 블록)
```jsx
import { TextLoadingSkeleton } from '@/components/ui/loading'

<TextLoadingSkeleton lines={5} />
```

#### ListLoadingSkeleton (리스트 아이템)
```jsx
import { ListLoadingSkeleton } from '@/components/ui/loading'

<ListLoadingSkeleton items={3} />
```

### 5. 기타 로딩 컴포넌트들

#### InlineLoading (인라인 로딩)
```jsx
import { InlineLoading } from '@/components/ui/loading'

<InlineLoading text="저장 중..." />
```

#### CenterLoading (센터 로딩)
```jsx
import { CenterLoading } from '@/components/ui/loading'

<CenterLoading text="로딩 중..." />
```

## 커스텀 훅

### useLoading (기본 로딩 상태)
```jsx
import { useLoading } from '@/hooks/useLoading'

const { loading, startLoading, stopLoading } = useLoading()
```

### useAsyncLoading (비동기 작업용)
```jsx
import { useAsyncLoading } from '@/hooks/useLoading'

const { loading, error, execute } = useAsyncLoading()

// 사용 예시
const handleSubmit = async () => {
  try {
    await execute(async () => {
      const result = await api.submit(data)
      return result
    })
  } catch (err) {
    console.error(err)
  }
}
```

### useMultiLoading (다중 로딩 상태)
```jsx
import { useMultiLoading } from '@/hooks/useLoading'

const { 
  loadingStates, 
  startLoading, 
  stopLoading, 
  isLoading 
} = useMultiLoading()

// 사용 예시
startLoading('fetch')
startLoading('submit')

if (isLoading('fetch')) {
  // fetch 로딩 중
}
```

### useTimedLoading (타이머 기반 로딩)
```jsx
import { useTimedLoading } from '@/hooks/useLoading'

const { loading, startLoading, stopLoading } = useTimedLoading(1000) // 최소 1초
```

## 사용 권장사항

### 스켈레톤 사용 시기
- 데이터가 로드되기 전 **레이아웃 구조**를 미리 보여줄 때
- 사용자에게 어떤 형태의 콘텐츠가 올지 예상할 수 있게 할 때
- 카드, 리스트, 텍스트 블록 등의 **구조적 로딩**

### 다른 로딩 표시 사용 시기
- 버튼 클릭 시 처리 중 상태 (`LoadingButton`)
- 전체 화면 로딩 (`LoadingOverlay`)
- 단순 처리 중 표시 (`Spinner`)

## 마이그레이션 가이드

### 기존 코드
```jsx
const [loading, setLoading] = useState(false)

// 로딩 시작
setLoading(true)
try {
  await apiCall()
} finally {
  setLoading(false)
}

// UI
{loading && <div className="animate-spin...">로딩 중...</div>}
```

### 개선된 코드
```jsx
const { loading, execute } = useAsyncLoading()

// 로딩 처리
await execute(async () => {
  await apiCall()
})

// UI
{loading && <CenterLoading text="로딩 중..." />}
```
