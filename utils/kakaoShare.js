// 카카오 템플릿 빌더를 활용한 뉴스레터 공유 유틸리티

// 1. 기본 방식 (지금까지 사용한 방법)
export function shareWithBasicTemplate() {
    if (typeof window === 'undefined' || !window.Kakao) {
        console.error('Kakao SDK not available');
        return Promise.reject(new Error('Kakao SDK not available'));
    }

    return window.Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
            title: '📰 오늘의 테크 뉴스',
            description: '최신 기술 트렌드를 확인하세요!',
            imageUrl: 'https://example.com/image.jpg',
            link: {
                webUrl: window.location.href
            }
        },
        buttons: [{
            title: '뉴스레터 보기',
            link: {
                webUrl: window.location.href
            }
        }]
    });
}

// 2. 사용자 정의 템플릿 방식 (템플릿 빌더 사용)
export function shareWithCustomTemplate(templateArgs) {
    if (typeof window === 'undefined' || !window.Kakao) {
        console.error('Kakao SDK not available');
        return Promise.reject(new Error('Kakao SDK not available'));
    }

    return window.Kakao.Link.sendCustom({
        templateId: 123798, // 템플릿 빌더에서 생성한 템플릿 ID
        templateArgs: templateArgs
    });
}

// 3. 뉴스레터 전용 템플릿 클래스
export class NewsletterKakaoShare {
    constructor(templateId, appKey) {
        this.templateId = templateId;
        this.appKey = appKey;
        this.init();
    }

    init() {
        if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(this.appKey);
        }
    }

    // 뉴스레터 공유 (사용자 정의 템플릿)
    shareNewsletter(newsletterData) {
        if (typeof window === 'undefined' || !window.Kakao) {
            console.error('Kakao SDK not available');
            return Promise.reject(new Error('Kakao SDK not available'));
        }

        const templateArgs = this.buildTemplateArgs(newsletterData);
        
        return window.Kakao.Link.sendCustom({
            templateId: this.templateId,
            templateArgs: templateArgs
        }).then(() => {
            this.trackShare('success', newsletterData.id);
        }).catch((error) => {
            this.trackShare('error', newsletterData.id, error.message);
            console.error('카카오톡 공유 실패:', error);
            throw error;
        });
    }

      // 템플릿 인자 구성
  buildTemplateArgs(data) {
    return {
      // 템플릿 빌더에서 설정한 변수명과 일치해야 함
      'TITLE': data.title || '뉴스레터',
      'DESCRIPTION': data.description || '',
      'thumbnail': data.imageUrl || data.authorAvatar || data.thumbnail || '',
      'WEB_URL': data.url || (typeof window !== 'undefined' ? window.location.href : ''),
      'MOBILE_URL': data.url || (typeof window !== 'undefined' ? window.location.href : ''),
      'PUBLISHED_DATE': this.formatDate(data.date || data.publishedDate),
      'CATEGORY': data.category || 'News',
      'AUTHOR': data.author || 'Newsphere',
      // 추가 커스텀 필드들
      'SUMMARY_1': data.sections?.[0]?.items?.[0]?.title || data.content?.[0]?.title || '',
      'SUMMARY_2': data.sections?.[0]?.items?.[1]?.title || data.content?.[1]?.title || '',
      'SUMMARY_3': data.sections?.[0]?.items?.[2]?.title || data.content?.[2]?.title || '',
      'ARTICLE_COUNT': (data.sections?.[0]?.items?.length || data.content?.length || 0)
    };
  }

    // 날짜 포맷팅
    formatDate(date) {
        if (!date) return new Date().toLocaleDateString('ko-KR');
        return new Date(date).toLocaleDateString('ko-KR');
    }

    // 공유 추적
    trackShare(status, newsletterId, error = null) {
        // Google Analytics나 다른 분석 도구로 전송
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'share', {
                method: 'kakao',
                content_type: 'newsletter',
                content_id: newsletterId,
                custom_parameter_1: status,
                custom_parameter_2: error
            });
        }

        // 서버로 통계 전송 (선택사항)
        if (typeof window !== 'undefined') {
            fetch('/api/newsletter/share-stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newsletterId: newsletterId,
                    shareType: 'kakao_custom',
                    templateId: this.templateId,
                    status: status,
                    error: error,
                    timestamp: new Date().toISOString()
                })
            }).catch(console.error);
        }
    }
}

// 4. 템플릿별 공유 함수 (여러 템플릿 사용시)
export const NewsletterTemplates = {
    // 일반 뉴스레터 템플릿
    GENERAL: 123798,
    // 특별 이슈 템플릿
    SPECIAL: 123799,
    // 주간 요약 템플릿
    WEEKLY: 123800
};

export function shareNewsletterWithTemplate(templateType, data) {
    if (typeof window === 'undefined' || !window.Kakao) {
        console.error('Kakao SDK not available');
        return Promise.reject(new Error('Kakao SDK not available'));
    }

    const templateId = NewsletterTemplates[templateType];
    
    if (!templateId) {
        console.error('알 수 없는 템플릿 타입:', templateType);
        return Promise.reject(new Error('알 수 없는 템플릿 타입'));
    }

    return window.Kakao.Link.sendCustom({
        templateId: templateId,
        templateArgs: {
            'title': data.title,
            'description': data.description,
            'url': data.url,
            // 템플릿별 특화 인자들...
        }
    });
}

// 5. A/B 테스트를 위한 템플릿 선택
export function shareWithABTest(data) {
    if (typeof window === 'undefined' || !window.Kakao) {
        console.error('Kakao SDK not available');
        return Promise.reject(new Error('Kakao SDK not available'));
    }

    // 사용자를 랜덤하게 두 그룹으로 나눔
    const useTemplateA = Math.random() > 0.5;
    const templateId = useTemplateA ? 123798 : 123799;
    
    // 어떤 템플릿을 사용했는지 추적
    trackABTest(templateId, data.id);
    
    return window.Kakao.Link.sendCustom({
        templateId: templateId,
        templateArgs: buildTemplateArgs(data)
    });
}

function trackABTest(templateId, newsletterId) {
    if (typeof window !== 'undefined') {
        fetch('/api/ab-test/kakao-template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateId: templateId,
                newsletterId: newsletterId,
                userId: getUserId(), // 사용자 식별자
                timestamp: new Date().toISOString()
            })
        }).catch(console.error);
    }
}

// 6. 카카오 SDK 로드 유틸리티
export function loadKakaoSDK() {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('Window is not available'));
            return;
        }

        if (window.Kakao) {
            resolve(window.Kakao);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
        script.async = true;
        script.onload = () => resolve(window.Kakao);
        script.onerror = () => reject(new Error('Failed to load Kakao SDK'));
        document.head.appendChild(script);
    });
}

// 7. 카카오 SDK 로드 유틸리티

// 8. 사용자 식별자 가져오기 (예시)
function getUserId() {
    // 실제 구현에서는 사용자 세션이나 로컬 스토리지에서 가져옴
    if (typeof window !== 'undefined') {
        return localStorage.getItem('userId') || 'anonymous';
    }
    return 'anonymous';
}

// 9. 템플릿 인자 빌더 (공통)
function buildTemplateArgs(data) {
  return {
    'TITLE': data.title || '뉴스레터',
    'DESCRIPTION': data.description || '',
    'thumbnail': data.imageUrl || data.authorAvatar || data.thumbnail || '',
    'WEB_URL': data.url || (typeof window !== 'undefined' ? window.location.href : ''),
    'MOBILE_URL': data.url || (typeof window !== 'undefined' ? window.location.href : ''),
    'PUBLISHED_DATE': new Date(data.date || data.publishedDate || Date.now()).toLocaleDateString('ko-KR'),
    'CATEGORY': data.category || 'News',
    'AUTHOR': data.author || 'Newsphere',
    'SUMMARY_1': data.sections?.[0]?.items?.[0]?.title || data.content?.[0]?.title || '',
    'SUMMARY_2': data.sections?.[0]?.items?.[1]?.title || data.content?.[1]?.title || '',
    'SUMMARY_3': data.sections?.[0]?.items?.[2]?.title || data.content?.[2]?.title || '',
    'ARTICLE_COUNT': (data.sections?.[0]?.items?.length || data.content?.length || 0)
  };
}
