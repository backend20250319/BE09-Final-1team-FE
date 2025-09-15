/**
 * 카카오톡 피드 B형 템플릿 생성 유틸리티
 * 뉴스레터 데이터를 카카오톡 피드 템플릿 형식으로 변환
 */

/**
 * 뉴스레터 데이터를 카카오톡 피드 B형 템플릿으로 변환
 * @param {Object} newsletterData - 뉴스레터 데이터
 * @param {Object} options - 추가 옵션
 * @returns {Object} 카카오톡 피드 템플릿 객체
 */
export function createKakaoFeedTemplate(newsletterData, options = {}) {
  const {
    baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    templateId = null,
    showSocial = true
  } = options

  // 뉴스 아이템들을 추출하여 피드 템플릿 형식으로 변환
  const newsItems = extractNewsItems(newsletterData)
  
  // 피드 B형 템플릿 구성
  const feedTemplate = {
    objectType: 'feed',
    content: {
      title: newsletterData.title || '피드 B형 뉴스레터',
      description: newsletterData.description || '오늘의 주요 뉴스를 확인해보세요',
      imageUrl: newsletterData.imageUrl || `${baseUrl}/images/placeholder-logo.svg`,
      link: {
        mobileWebUrl: `${baseUrl}/newsletter/preview`,
        webUrl: `${baseUrl}/newsletter/preview`
      }
    },
    itemContent: {
      profileText: 'Newsphere',
      profileImageUrl: `${baseUrl}/images/placeholder-logo.svg`,
      titleImageUrl: `${baseUrl}/images/placeholder-logo.svg`,
      titleImageText: newsletterData.title || '피드 B형 뉴스레터',
      titleImageCategory: newsletterData.category || '뉴스',
      items: newsItems,
      sum: '총 뉴스 개수',
      sumOp: `${newsItems.length}개`
    }
  }

  // 소셜 정보 추가 (선택사항)
  if (showSocial) {
    feedTemplate.social = {
      likeCount: Math.floor(Math.random() * 100) + 10,
      commentCount: Math.floor(Math.random() * 50) + 5,
      sharedCount: Math.floor(Math.random() * 30) + 3
    }
  }

  // 버튼 추가
  feedTemplate.buttons = [
    {
      title: '뉴스레터 보기',
      link: {
        mobileWebUrl: `${baseUrl}/newsletter/preview`,
        webUrl: `${baseUrl}/newsletter/preview`
      }
    },
    {
      title: '구독하기',
      link: {
        mobileWebUrl: `${baseUrl}/newsletter`,
        webUrl: `${baseUrl}/newsletter`
      }
    }
  ]

  return feedTemplate
}

/**
 * 뉴스레터 데이터에서 뉴스 아이템들을 추출하여 피드 템플릿 형식으로 변환
 * @param {Object} newsletterData - 뉴스레터 데이터
 * @returns {Array} 피드 템플릿 아이템 배열
 */
function extractNewsItems(newsletterData) {
  const items = []
  
  if (newsletterData.sections && Array.isArray(newsletterData.sections)) {
    newsletterData.sections.forEach(section => {
      if (section.items && Array.isArray(section.items)) {
        section.items.slice(0, 5).forEach(item => { // 최대 5개 아이템
          items.push({
            item: item.title || '뉴스 제목',
            itemOp: formatNewsItem(item)
          })
        })
      }
    })
  }

  // 아이템이 없으면 기본 아이템 추가
  if (items.length === 0) {
    items.push(
      {
        item: 'AI 기술 발전으로 인한 업계 변화',
        itemOp: '인공지능 기술이 급속도로 발전하면서...'
      },
      {
        item: '코로나19 이후 경제 회복 전망',
        itemOp: '전문가들은 코로나19 이후 경제 회복이...'
      },
      {
        item: '새로운 정책 발표',
        itemOp: '정부가 새로운 정책을 발표하여...'
      }
    )
  }

  return items
}

/**
 * 뉴스 아이템을 피드 템플릿 형식으로 포맷팅
 * @param {Object} item - 뉴스 아이템
 * @returns {String} 포맷팅된 아이템 정보
 */
function formatNewsItem(item) {
  if (item.summary) {
    // 요약이 있으면 요약 사용 (최대 20자)
    return item.summary.length > 20 
      ? item.summary.substring(0, 20) + '...'
      : item.summary
  }
  
  if (item.publishedAt) {
    // 발행일이 있으면 발행일 표시
    const date = new Date(item.publishedAt)
    return date.toLocaleDateString('ko-KR')
  }
  
  // 기본값
  return '뉴스 요약'
}

/**
 * 피드 템플릿을 카카오톡으로 공유
 * @param {Object} feedTemplate - 피드 템플릿 객체
 * @param {Object} Kakao - 카카오 SDK 객체
 * @returns {Promise} 공유 결과
 */
export async function shareKakaoFeed(feedTemplate, Kakao) {
  try {
    if (!Kakao || !Kakao.Share) {
      throw new Error('카카오 SDK가 초기화되지 않았습니다.')
    }

    // 피드 템플릿 공유
    const result = await Kakao.Share.sendDefault(feedTemplate)
    console.log('카카오톡 피드 공유 성공:', result)
    return result
  } catch (error) {
    console.error('카카오톡 피드 공유 실패:', error)
    throw error
  }
}

/**
 * 뉴스레터 데이터로부터 카카오톡 피드 공유 실행
 * @param {Object} newsletterData - 뉴스레터 데이터
 * @param {Object} options - 추가 옵션
 * @returns {Promise} 공유 결과
 */
export async function shareNewsletterAsKakaoFeed(newsletterData, options = {}) {
  try {
    // 카카오 SDK 로드
    const Kakao = await loadKakaoSDK()
    
    if (!Kakao || !Kakao.isInitialized()) {
      throw new Error('카카오 SDK가 초기화되지 않았습니다.')
    }

    // 피드 템플릿 생성
    const feedTemplate = createKakaoFeedTemplate(newsletterData, options)
    console.log('생성된 피드 템플릿:', feedTemplate)

    // 피드 공유 실행
    const result = await shareKakaoFeed(feedTemplate, Kakao)
    return result
  } catch (error) {
    console.error('뉴스레터 카카오톡 피드 공유 실패:', error)
    throw error
  }
}

/**
 * 카카오 SDK 동적 로드
 * @returns {Promise<Object>} 카카오 SDK 객체
 */
async function loadKakaoSDK() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('브라우저 환경이 아닙니다.'))
      return
    }

    if (window.Kakao) {
      resolve(window.Kakao)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'
    script.integrity = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4'
    script.crossOrigin = 'anonymous'
    
    script.onload = () => {
      if (window.Kakao) {
        // 카카오 SDK 초기화
        const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '58255a3390abb537df22b14097e5265e'
        window.Kakao.init(KAKAO_JS_KEY)
        resolve(window.Kakao)
      } else {
        reject(new Error('카카오 SDK 로드 실패'))
      }
    }
    
    script.onerror = () => {
      reject(new Error('카카오 SDK 스크립트 로드 실패'))
    }
    
    document.head.appendChild(script)
  })
}
