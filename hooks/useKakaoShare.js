import { useState, useEffect } from 'react';
import { NewsletterKakaoShare, loadKakaoSDK } from '../utils/kakaoShare';

// 카카오 공유 React Hook
export function useKakaoShare(templateId = 123798, appKey = null) {
    const [kakaoShare, setKakaoShare] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);



    
    useEffect(() => {
        const initKakao = async () => {
            try {
                await loadKakaoSDK();
                const shareInstance = new NewsletterKakaoShare(
                    templateId,
                    appKey || process.env.NEXT_PUBLIC_KAKAO_APP_KEY || 'YOUR_JAVASCRIPT_KEY'
                );
                setKakaoShare(shareInstance);
            } catch (err) {
                setError(err.message);
                console.error('Kakao SDK 초기화 실패:', err);
            }
        };

        initKakao();
    }, [templateId, appKey]);

    const share = async (newsletterData) => {
        if (!kakaoShare) {
            throw new Error('Kakao share not initialized');
        }

        setIsLoading(true);
        setError(null);

        try {
            await kakaoShare.shareNewsletter(newsletterData);
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { share, isLoading, error, kakaoShare };
}

// 간단한 카카오 공유 훅 (기본 템플릿 사용)
export function useSimpleKakaoShare() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const share = async (data) => {
        setIsLoading(true);
        setError(null);

        try {
            if (typeof window === 'undefined' || !window.Kakao) {
                throw new Error('Kakao SDK not available');
            }

            await window.Kakao.Link.sendDefault({
                objectType: 'feed',
                content: {
                    title: data.title || '📰 뉴스레터',
                    description: data.description || '흥미로운 뉴스를 확인해보세요!',
                    imageUrl: data.imageUrl || data.authorAvatar || '',
                    link: {
                        webUrl: data.url || window.location.href
                    }
                },
                buttons: [{
                    title: '뉴스레터 보기',
                    link: {
                        webUrl: data.url || window.location.href
                    }
                }]
            });

            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { share, isLoading, error };
}
