'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

// 카카오톡 공유 컴포넌트
const KakaoShare = ({ 
  newsletterData, 
  className = '', 
  showStats = true,
  showFloating = true 
}) => {
  const [shareStats, setShareStats] = useState({
    kakao: 0,
    twitter: 0,
    facebook: 0,
    link: 0,
    total: 0
  })
  const [isKakaoInitialized, setIsKakaoInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 카카오 SDK 초기화
  useEffect(() => {
    const initKakao = async () => {
      try {
        // 카카오 SDK가 이미 로드되어 있는지 확인
        if (window.Kakao && !window.Kakao.isInitialized()) {
          // 실제 사용시 본인의 JavaScript 키로 교체
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '58255a3390abb537df22b14097e5265e')
          setIsKakaoInitialized(true)
          console.log('✅ 카카오 SDK 초기화 완료')
        } else if (window.Kakao && window.Kakao.isInitialized()) {
          setIsKakaoInitialized(true)
          console.log('✅ 카카오 SDK 이미 초기화됨')
        }
      } catch (error) {
        console.error('❌ 카카오 SDK 초기화 실패:', error)
        toast.error('카카오톡 공유 기능을 초기화할 수 없습니다.')
      }
    }

    // 카카오 SDK 스크립트 로드
    const loadKakaoSDK = () => {
      if (!window.Kakao) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/kakao-js-sdk/1.43.0/kakao.min.js'
        script.onload = initKakao
        script.onerror = () => {
          console.error('❌ 카카오 SDK 로드 실패')
          toast.error('카카오톡 공유 기능을 로드할 수 없습니다.')
        }
        document.head.appendChild(script)
      } else {
        initKakao()
      }
    }

    loadKakaoSDK()
  }, [])

  // 공유 통계 로드
  useEffect(() => {
    if (showStats) {
      loadShareStats()
    }
  }, [showStats])

  // 공유 통계 로드 함수
  const loadShareStats = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/newsletters/share-stats?newsletterId=${newsletterData?.id || 'default'}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setShareStats({
            kakao: data.data.sharesByType?.kakao || 0,
            twitter: data.data.sharesByType?.twitter || 0,
            facebook: data.data.sharesByType?.facebook || 0,
            link: data.data.sharesByType?.link || 0,
            total: data.data.totalShares || 0
          })
        }
      }
    } catch (error) {
      console.error('❌ 공유 통계 로드 실패:', error)
    }
  }

  // 공유 통계 전송 함수
  const sendShareStats = async (shareType) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await fetch('/api/newsletters/share-stats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsletterId: newsletterData?.id || 'default',
          shareType,
          timestamp: new Date().toISOString()
        })
      })

      // 로컬 통계 업데이트
      setShareStats(prev => ({
        ...prev,
        [shareType]: prev[shareType] + 1,
        total: prev.total + 1
      }))
    } catch (error) {
      console.error('❌ 공유 통계 전송 실패:', error)
    }
  }

  // 카카오톡 공유
  const shareToKakao = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      if (!isKakaoInitialized) {
        toast.error('카카오톡 공유 기능이 준비되지 않았습니다.')
        return
      }

      const shareData = {
        objectType: 'feed',
        content: {
          title: newsletterData?.title || '📰 뉴스레터',
          description: newsletterData?.description || '유용한 정보를 확인해보세요!',
          imageUrl: newsletterData?.imageUrl || 'https://via.placeholder.com/800x400/667eea/ffffff?text=Newsletter',
          link: {
            webUrl: window.location.href,
            mobileWebUrl: window.location.href
          }
        },
        buttons: [{
          title: '뉴스레터 보기',
          link: {
            webUrl: window.location.href,
            mobileWebUrl: window.location.href
          }
        }]
      }

      await window.Kakao.Link.sendDefault(shareData)
      
      toast.success('✅ 카카오톡 공유 완료!')
      sendShareStats('kakao')
      
    } catch (error) {
      console.error('❌ 카카오톡 공유 실패:', error)
      toast.error('카카오톡 공유에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 트위터 공유
  const shareToTwitter = () => {
    const text = encodeURIComponent(newsletterData?.title || '📰 뉴스레터')
    const url = encodeURIComponent(window.location.href)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=550,height=420')
    toast.success('🐦 트위터 공유창이 열렸습니다!')
    sendShareStats('twitter')
  }

  // 페이스북 공유
  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=550,height=420')
    toast.success('📘 페이스북 공유창이 열렸습니다!')
    sendShareStats('facebook')
  }

  // 링크 복사
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('🔗 링크가 복사되었습니다!')
      sendShareStats('link')
    } catch (error) {
      console.error('❌ 링크 복사 실패:', error)
      toast.error('링크 복사에 실패했습니다.')
    }
  }

  // 이메일 공유
  const shareToEmail = () => {
    const subject = encodeURIComponent(newsletterData?.title || '📰 뉴스레터')
    const body = encodeURIComponent(`${newsletterData?.description || '유용한 정보를 확인해보세요!'}\n\n${window.location.href}`)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
    toast.success('📧 이메일 공유창이 열렸습니다!')
    sendShareStats('email')
  }

  return (
    <>
      {/* 메인 공유 버튼들 */}
      <div className={`share-section ${className}`}>
        <div className="share-buttons">
          <button 
            className="share-btn kakao-btn"
            onClick={shareToKakao}
            disabled={isLoading}
          >
            {isLoading ? '⏳' : '💬'} 카카오톡 공유
          </button>
          
          <button className="share-btn twitter-btn" onClick={shareToTwitter}>
            🐦 트위터 공유
          </button>
          
          <button className="share-btn facebook-btn" onClick={shareToFacebook}>
            📘 페이스북 공유
          </button>
          
          <button className="share-btn copy-btn" onClick={copyLink}>
            🔗 링크 복사
          </button>
          
          <button className="share-btn email-btn" onClick={shareToEmail}>
            📧 이메일 공유
          </button>
        </div>

        {/* 공유 통계 */}
        {showStats && (
          <div className="stats-section">
            <h3>📊 이 뉴스레터가 인기있어요!</h3>
            <div className="share-stats">
              <div className="stat-item">
                <div className="stat-number">{shareStats.kakao}</div>
                <div className="stat-label">카카오톡 공유</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{shareStats.twitter}</div>
                <div className="stat-label">트위터 공유</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{shareStats.facebook}</div>
                <div className="stat-label">페이스북 공유</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{shareStats.link}</div>
                <div className="stat-label">링크 복사</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{shareStats.total}</div>
                <div className="stat-label">총 공유</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 플로팅 공유 버튼 */}
      {showFloating && (
        <div className="floating-share">
          <button 
            className="share-btn kakao-btn"
            onClick={shareToKakao}
            disabled={isLoading}
            title="카카오톡 공유"
          >
            {isLoading ? '⏳' : '💬'}
          </button>
          <button 
            className="share-btn copy-btn" 
            onClick={copyLink}
            title="링크 복사"
          >
            🔗
          </button>
        </div>
      )}

      <style jsx>{`
        .share-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
          border: 1px solid #e9ecef;
        }
        
        .share-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .share-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 120px;
          justify-content: center;
        }
        
        .share-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .kakao-btn {
          background: #fee500;
          color: #000;
        }
        
        .kakao-btn:hover:not(:disabled) {
          background: #fdd800;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(254, 229, 0, 0.4);
        }
        
        .twitter-btn {
          background: #1da1f2;
          color: white;
        }
        
        .twitter-btn:hover {
          background: #0d8bd9;
          transform: translateY(-2px);
        }
        
        .facebook-btn {
          background: #4267b2;
          color: white;
        }
        
        .facebook-btn:hover {
          background: #365899;
          transform: translateY(-2px);
        }
        
        .copy-btn {
          background: #6c757d;
          color: white;
        }
        
        .copy-btn:hover {
          background: #545b62;
          transform: translateY(-2px);
        }
        
        .email-btn {
          background: #28a745;
          color: white;
        }
        
        .email-btn:hover {
          background: #218838;
          transform: translateY(-2px);
        }
        
        .stats-section {
          background: #e3f2fd;
          padding: 20px;
          margin-top: 20px;
          border-radius: 8px;
          text-align: center;
        }
        
        .stats-section h3 {
          margin-bottom: 15px;
          color: #1976d2;
          font-size: 1.1rem;
        }
        
        .share-stats {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .stat-item {
          text-align: center;
          min-width: 80px;
        }
        
        .stat-number {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1976d2;
        }
        
        .stat-label {
          font-size: 0.8rem;
          color: #666;
          margin-top: 5px;
        }
        
        .floating-share {
          position: fixed;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 1000;
        }
        
        .floating-share .share-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          justify-content: center;
          font-size: 18px;
          min-width: auto;
        }
        
        @media (max-width: 768px) {
          .floating-share {
            display: none;
          }
          
          .share-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .share-btn {
            width: 200px;
            justify-content: center;
          }
          
          .share-stats {
            flex-direction: column;
            align-items: center;
          }
          
          .stat-item {
            min-width: auto;
          }
        }
      `}</style>
    </>
  )
}

export default KakaoShare
