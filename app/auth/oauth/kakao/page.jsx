"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function KakaoOAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    if (error) {
      console.error('카카오 로그인 오류:', error)
      setStatus('error')
      setMessage('카카오 로그인에 실패했습니다.')
      return
    }

    if (code) {
      console.log('카카오 인증 코드:', code)
      
      // 여기서 서버에 인증 코드를 전송하여 액세스 토큰을 받아오는 로직을 구현할 수 있습니다.
      // 현재는 클라이언트에서 직접 처리합니다.
      
      try {
        // 카카오 SDK가 로드되었는지 확인
        if (window.Kakao && window.Kakao.Auth) {
          // URL에서 인증 코드를 추출하여 토큰으로 교환
          const urlParams = new URLSearchParams(window.location.search)
          const authCode = urlParams.get('code')
          
          if (authCode) {
            // 실제 프로덕션에서는 서버에서 토큰 교환을 처리해야 합니다.
            // 여기서는 간단히 성공 처리합니다.
            setStatus('success')
            setMessage('카카오 로그인이 완료되었습니다!')
            
            // 2초 후 리다이렉트
            setTimeout(() => {
              if (state === 'sendfriend_newsletter') {
                router.push('/newsletter')
              } else {
                router.push('/')
              }
            }, 2000)
          }
        } else {
          setStatus('error')
          setMessage('카카오 SDK가 로드되지 않았습니다.')
        }
      } catch (err) {
        console.error('토큰 처리 오류:', err)
        setStatus('error')
        setMessage('인증 처리 중 오류가 발생했습니다.')
      }
    } else {
      setStatus('error')
      setMessage('인증 코드를 받지 못했습니다.')
    }
  }, [searchParams, router])

  const handleRetry = () => {
    router.push('/auth/oauth/kakao')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <h2 className="text-xl font-semibold mb-2">카카오 로그인 처리 중</h2>
              <p className="text-gray-600">잠시만 기다려주세요...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h2 className="text-xl font-semibold mb-2 text-green-800">로그인 성공!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">잠시 후 자동으로 이동합니다...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
              <h2 className="text-xl font-semibold mb-2 text-red-800">로그인 실패</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="space-y-2">
                <Button onClick={handleRetry} className="w-full">
                  다시 시도
                </Button>
                <Button variant="outline" onClick={handleGoHome} className="w-full">
                  홈으로 이동
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
