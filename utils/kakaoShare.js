// 카카오 템플릿 빌더를 활용한 뉴스레터 공유 유틸리티 (수정됨)

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

// 3. 뉴스레터 전용 템플릿 클래스 (수정됨)
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
        
        // 디버깅을 위해 템플릿 인자 로그 출력
        console.log('Template Args:', templateArgs);
        
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

    // 템플릿 인자 구성 (카카오 템플릿 변수명에 맞게 수정)
    buildTemplateArgs(data) {
        // 뉴스레터 미리보기 URL 생성 (실제 newsletterId 사용)
        const newsletterPreviewUrl = data.id 
            ? `${typeof window !== 'undefined' ? window.location.origin : ''}/newsletter/${data.id}/preview`
            : (typeof window !== 'undefined' ? window.location.href : '');
        
        console.log('🔗 생성된 뉴스레터 URL:', newsletterPreviewUrl);
        console.log('📊 뉴스레터 데이터:', data);
        
        // 카카오 개발자 콘솔 템플릿에서 정의한 실제 변수명을 사용해야 합니다
        // 이미지에서 확인된 변수명들을 기반으로 수정
        return {
            // 카카오 템플릿 변수명 (${} 제거, 변수명만 사용)
            // 카카오 개발자 콘솔에서 템플릿을 확인하고 정확한 변수명을 사용하세요
            TITLE: data.title || '뉴스레터',
            DESCRIPTION: data.description || '흥미로운 뉴스를 확인해보세요',
            IMAGE_URL: data.imageUrl || data.authorAvatar || data.thumbnail || 'https://via.placeholder.com/400x300',
            WEB_URL: newsletterPreviewUrl,
            MOBILE_URL: newsletterPreviewUrl,
            NEWSLETTER_ID: String(data.id || '1'),
            DOMAIN: typeof window !== 'undefined' ? window.location.origin : '',
            REGI_WEB_DOMAIN: typeof window !== 'undefined' ? window.location.origin : '',
            
            // 추가 변수들 (실제 템플릿에 따라 수정 필요)
            PUBLISHED_DATE: this.formatDate(data.date || data.publishedDate),
            CATEGORY: data.category || 'News',
            AUTHOR: data.author || 'Newsphere',
            SUMMARY1: data.sections?.[0]?.items?.[0]?.title || data.content?.[0]?.title || '',
            SUMMARY2: data.sections?.[0]?.items?.[1]?.title || data.content?.[1]?.title || '',
            SUMMARY3: data.sections?.[0]?.items?.[2]?.title || data.content?.[2]?.title || '',
            ARTICLE_COUNT: String(data.sections?.[0]?.items?.length || data.content?.length || 0),
            
            // 추가 가능한 변수명들 (템플릿에 따라 다를 수 있음)
            CONTENT_TITLE: data.title || '뉴스레터',
            CONTENT_DESC: data.description || '',
            LINK_URL: newsletterPreviewUrl,
            BUTTON_TITLE: '뉴스레터 보기',
            USER_NAME: '구독자',
            READ_TIME: '5분',
            TOTAL_ARTICLES: String(data.sections?.[0]?.items?.length || data.content?.length || 0)
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

// 4. 템플릿 변수명 확인 및 테스트 함수
export function debugTemplateVariables(data) {
    console.log('=== 카카오 템플릿 변수 디버깅 ===');
    
    // 뉴스레터 미리보기 URL 생성
    const newsletterPreviewUrl = data.id 
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/newsletter/${data.id}/preview`
        : (typeof window !== 'undefined' ? window.location.href : '');
    
    const templateArgs = {
        // 카카오 템플릿 변수명 (${} 제거, 변수명만 사용)
        REGI_WEB_DOMAIN: typeof window !== 'undefined' ? window.location.origin : '',
        IMAGE_URL: data.imageUrl || 'https://via.placeholder.com/400x300',
        NEWSLETTER_URL: newsletterPreviewUrl,
        NEWSLETTER_ID: String(data.id || '1'),
        TITLE: data.title || '뉴스레터',
        DESCRIPTION: data.description || '',
        WEB_URL: newsletterPreviewUrl,
        MOBILE_URL: newsletterPreviewUrl,
        CATEGORY: data.category || 'News',
        AUTHOR: data.author || 'Newsphere'
    };
    
    console.log('Template Args:', templateArgs);
    console.log('Current Domain:', typeof window !== 'undefined' ? window.location.origin : 'N/A');
    console.log('Newsletter Preview URL:', newsletterPreviewUrl);
    
    // 실제 템플릿 변수명을 찾기 위한 테스트
    if (typeof window !== 'undefined' && window.Kakao) {
        return window.Kakao.Link.sendCustom({
            templateId: 123798,
            templateArgs: templateArgs
        });
    }
}

// 5. 카카오 개발자 콘솔에서 템플릿 변수명 확인 가이드
export function getTemplateVariableGuide() {
    return `
    === 카카오 템플릿 변수명 확인 방법 ===
    
    1. 카카오 개발자 콘솔 접속
    2. 도구 > 메시지 템플릿 빌더
    3. 해당 템플릿 (ID: 123798) 선택
    4. 템플릿에서 사용된 모든 \${변수명} 확인
    5. 아래 함수의 templateArgs 객체를 실제 변수명으로 수정
    
    현재 확인된 변수:
    - \${REGI_WEB_DOMAIN}
    - \${IMAGE_URL}
    
    추가로 확인 필요한 변수들을 실제 템플릿에서 찾아서 
    buildTemplateArgs 함수를 수정하세요.
    `;
}

// 6. 템플릿별 공유 함수 (여러 템플릿 사용시)
export const NewsletterTemplates = {
    // 일반 뉴스레터 템플릿
    GENERAL: 123798,
    // 특별 이슈 템플릿
    SPECIAL: 123799,
    // 주간 요약 템플릿
    WEEKLY: 123800
};

// 7. 카카오 SDK 로드 유틸리티
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

// 8. 실제 사용 예시
export function exampleUsage() {
    // 1. SDK 초기화
    const kakaoShare = new NewsletterKakaoShare(123798, 'YOUR_JAVASCRIPT_KEY');
    
    // 2. 뉴스레터 데이터 준비
    const newsletterData = {
        title: '사용자 맞춤형 뉴스레터',
        description: '바리만 봐도 즐거워지는 월렛 패키지에는 시크릿 스토리가 숨어있었으요.',
        imageUrl: 'https://example.com/newsletter-image.jpg',
        url: window.location.href,
        author: 'Newsphere',
        category: 'Technology',
        date: new Date(),
        sections: [{
            items: [
                { title: '첫 번째 뉴스 제목' },
                { title: '두 번째 뉴스 제목' },
                { title: '세 번째 뉴스 제목' }
            ]
        }]
    };
    
    // 3. 공유 실행
    kakaoShare.shareNewsletter(newsletterData)
        .then(() => console.log('공유 성공'))
        .catch(error => console.error('공유 실패:', error));
}