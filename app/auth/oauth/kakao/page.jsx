"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { setUserInfo } from '@/lib/auth/auth'

export default function KakaoOAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')

  // 카카오 OAuth 콜백 처리 함수 (URL 파라미터 방식)
  const handleKakaoCallback = async (success, userId, email, nickname, role, state) => {
    try {
      console.log('카카오 OAuth 콜백 처리 시작:', { success, userId, email, nickname, role, state })
      
      if (success !== 'true') {
        throw new Error('카카오 로그인에 실패했습니다.')
      }

      // URL 파라미터에서 받은 기본 사용자 정보로 임시 사용자 객체 생성
      const tempUserInfo = {
        id: userId,
        email: email,
        nickname: nickname,
        role: role
      }

      console.log('URL 파라미터에서 받은 사용자 정보:', tempUserInfo)

      // 쿠키의 JWT 토큰을 자동으로 포함하여 상세 사용자 정보 조회
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include' // 쿠키 포함
      })

      const data = await response.json()
      console.log('/api/auth/me 응답:', data)

      if (!response.ok || !data.success) {
        // API 호출 실패 시 URL 파라미터 정보라도 저장
        console.warn('상세 사용자 정보 조회 실패, URL 파라미터 정보 사용:', data)
        setUserInfo(tempUserInfo)
      } else {
        // API 호출 성공 시 상세 사용자 정보 저장
        console.log('상세 사용자 정보 저장:', data.data)
        setUserInfo(data.data)
      }

      setStatus('success')
      if (state === 'talk_message_permission') {
        setMessage('카카오톡 메시지 권한이 허용되었습니다!')
      } else {
        setMessage('카카오 로그인이 완료되었습니다!')
      }
      
      // 2초 후 리다이렉트
      setTimeout(() => {
        if (state === 'sendfriend_newsletter') {
          router.push('/newsletter')
        } else if (state === 'talk_message_permission') {
          // 카카오톡 메시지 권한 요청 후 원래 페이지로 돌아가기
          const returnUrl = sessionStorage.getItem('kakao_permission_return_url') || '/newsletter/preview'
          sessionStorage.removeItem('kakao_permission_return_url')
          
          // 권한 요청 완료 파라미터 추가
          const url = new URL(returnUrl, window.location.origin)
          url.searchParams.set('permission_granted', 'true')
          router.push(url.toString())
        } else {
          router.push('/')
        }
      }, 2000)

    } catch (err) {
      console.error('카카오 OAuth 콜백 처리 오류:', err)
      setStatus('error')
      setMessage(err.message || '인증 처리 중 오류가 발생했습니다.')
    }
  }

  // 기존 방식 처리 함수 (code 파라미터)
  const handleLegacyKakaoCallback = async (code, state) => {
    try {
      console.log('기존 방식 카카오 OAuth 콜백 처리 시작:', { code: code.substring(0, 20) + '...', state })
      
      // 임시로 성공 처리 (실제로는 백엔드에서 처리되어야 함)
      setStatus('success')
      if (state === 'talk_message_permission') {
        setMessage('카카오톡 메시지 권한이 허용되었습니다!')
      } else {
        setMessage('카카오 로그인이 완료되었습니다!')
      }
      
      // 2초 후 리다이렉트
      setTimeout(() => {
        if (state === 'sendfriend_newsletter') {
          router.push('/newsletter')
        } else if (state === 'talk_message_permission') {
          // 카카오톡 메시지 권한 요청 후 원래 페이지로 돌아가기
          const returnUrl = sessionStorage.getItem('kakao_permission_return_url') || '/newsletter/preview'
          sessionStorage.removeItem('kakao_permission_return_url')
          
          // 권한 요청 완료 파라미터 추가
          const url = new URL(returnUrl, window.location.origin)
          url.searchParams.set('permission_granted', 'true')
          router.push(url.toString())
        } else {
          router.push('/')
        }
      }, 2000)

    } catch (err) {
      console.error('기존 방식 카카오 OAuth 콜백 처리 오류:', err)
      setStatus('error')
      setMessage(err.message || '인증 처리 중 오류가 발생했습니다.')
    }
  }

  useEffect(() => {
    // URL 파라미터에서 사용자 정보 읽기 (새로운 OAuth2 플로우)
    const success = searchParams.get('success')
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    const nickname = searchParams.get('nickname')
    const role = searchParams.get('role')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    // 기존 방식 지원 (code 파라미터)
    const code = searchParams.get('code')

    // 디버깅을 위한 URL 파라미터 로그
    console.log('카카오 OAuth 콜백 파라미터:', {
      success,
      userId,
      email,
      nickname,
      role,
      state,
      error,
      code: code ? code.substring(0, 20) + '...' : null,
      fullUrl: window.location.href,
      search: window.location.search
    })

    if (error) {
      console.error('카카오 로그인 오류:', error)
      setStatus('error')
      setMessage(`카카오 로그인에 실패했습니다. (${error})`)
      return
    }

    // 새로운 OAuth2 플로우 (URL 파라미터에 사용자 정보가 있는 경우)
    if (success && userId && email) {
      console.log('새로운 OAuth2 플로우: URL 파라미터에서 사용자 정보 처리')
      handleKakaoCallback(success, userId, email, nickname, role, state)
    }
    // 기존 방식 (code 파라미터가 있는 경우)
    else if (code) {
      console.log('기존 방식: code 파라미터로 처리')
      handleLegacyKakaoCallback(code, state)
    }
    else {
      // URL 파라미터가 없는 경우 - 아직 OAuth 인증이 시작되지 않았거나 다른 경로로 접근
      console.log('OAuth 인증 파라미터가 없습니다. 카카오 로그인을 시작합니다.')
      setStatus('loading')
      setMessage('카카오 로그인을 시작합니다...')
      
      // 자동으로 카카오 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/auth')
      }, 2000)
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
