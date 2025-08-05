'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle, AlertCircle, PartyPopper } from 'lucide-react'

export default function SubscribeForm({ onSubscribeSuccess }) {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setSuccess(true)
        setEmail('')
        setShowCelebration(true)
        
        // 축하 애니메이션 3초 후 제거
        setTimeout(() => {
          setShowCelebration(false)
        }, 3000)
        
        // 부모 컴포넌트에 구독 성공 알림
        if (onSubscribeSuccess) {
          onSubscribeSuccess(email)
        }
      } else {
        setError(data.message || '구독에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSuccess(false)
    setError('')
    setShowCelebration(false)
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50 relative overflow-hidden">
        {showCelebration && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-bounce">
              <PartyPopper className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">✅ 구독이 완료되었습니다!</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            매일 아침 엄선된 뉴스를 이메일로 받아보실 수 있습니다.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetForm}
            className="mt-2"
          >
            다시 구독하기
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5 text-blue-600" />
          뉴스레터 구독
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Input
              type="email"
              placeholder="이메일 주소를 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            disabled={isLoading}
          >
            {isLoading ? '구독 중...' : '구독하기'}
          </Button>
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </form>
        <p className="text-xs text-gray-500 mt-2">
          언제든지 구독을 해지할 수 있습니다.
        </p>
      </CardContent>
    </Card>
  )
} 