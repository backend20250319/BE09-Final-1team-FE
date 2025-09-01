"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useKakaoShare, useSimpleKakaoShare } from "../hooks/useKakaoShare"
import { Share2, CheckCircle, AlertCircle } from "lucide-react"

// 카카오 공유 버튼 컴포넌트
export default function KakaoShareButton({ 
  data, 
  templateId = 123798, 
  useCustomTemplate = true,
  className = "",
  children 
}) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  // 템플릿 타입에 따라 다른 훅 사용
  const customShare = useKakaoShare(templateId)
  const simpleShare = useSimpleKakaoShare()

  const { share, isLoading, error } = useCustomTemplate ? customShare : simpleShare

  const handleShare = async () => {
    try {
      await share(data)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('카카오톡 공유 실패:', error)
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
    }
  }

  return (
    <div className="relative">
      <Button
        onClick={handleShare}
        disabled={isLoading}
        className={`flex items-center gap-2 ${className}`}
        variant="outline"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            공유 중...
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            {children || '카카오톡 공유'}
          </>
        )}
      </Button>

      {/* 성공 메시지 */}
      {showSuccess && (
        <div className="absolute -top-12 left-0 bg-green-100 border border-green-300 text-green-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2 z-10">
          <CheckCircle className="h-4 w-4" />
          공유되었습니다!
        </div>
      )}

      {/* 에러 메시지 */}
      {showError && (
        <div className="absolute -top-12 left-0 bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2 z-10">
          <AlertCircle className="h-4 w-4" />
          공유에 실패했습니다
        </div>
      )}
    </div>
  )
}

// 간단한 카카오 공유 버튼 (기본 템플릿 사용)
export function SimpleKakaoShareButton({ data, className = "", children }) {
  return (
    <KakaoShareButton
      data={data}
      useCustomTemplate={false}
      className={className}
    >
      {children}
    </KakaoShareButton>
  )
}

// 뉴스레터 전용 카카오 공유 버튼
export function NewsletterKakaoShareButton({ newsletter, className = "" }) {
  return (
    <KakaoShareButton
      data={newsletter}
      templateId={123798}
      useCustomTemplate={true}
      className={className}
    >
      뉴스레터 공유
    </KakaoShareButton>
  )
}
