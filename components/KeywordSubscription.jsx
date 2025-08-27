"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Bell, 
  Plus, 
  X, 
  Search,
  TrendingUp,
  Clock
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMultiLoading } from "@/hooks/useLoading"
import { CenterLoading } from "@/components/ui/loading"

export default function KeywordSubscription({ 
  userId, 
  email,
  className = "" 
}) {
  const [keyword, setKeyword] = useState("")
  const [subscriptions, setSubscriptions] = useState([])
  const { 
    loadingStates,
    startLoading,
    stopLoading,
    isLoading
  } = useMultiLoading()
  const { toast } = useToast()

  // 구독 목록 로드
  useEffect(() => {
    if (userId || email) {
      loadSubscriptions()
    }
  }, [userId, email])

  const loadSubscriptions = async () => {
    startLoading('list')
    try {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (email) params.append('email', email)

      const response = await fetch(`/api/subscribe/keywords?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions || [])
      }
    } catch (error) {
      console.error("구독 목록 로드 실패:", error)
      toast({
        title: "오류",
        description: "구독 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      stopLoading('list')
    }
  }

  // 키워드 구독 추가
  const handleSubscribe = async () => {
    if (!keyword.trim()) {
      toast({
        title: "알림",
        description: "키워드를 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    startLoading('subscribe')
    try {
      const response = await fetch('/api/subscribe/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          userId,
          email
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "성공",
          description: `"${keyword}" 키워드 구독이 완료되었습니다.`,
        })
        setKeyword("")
        loadSubscriptions() // 목록 새로고침
      } else {
        toast({
          title: "오류",
          description: data.error || "구독에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("키워드 구독 실패:", error)
      toast({
        title: "오류",
        description: "구독 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      stopLoading('subscribe')
    }
  }

  // 키워드 구독 취소
  const handleUnsubscribe = async (subscriptionId, keywordText) => {
    try {
      const params = new URLSearchParams({
        id: subscriptionId
      })
      if (userId) params.append('userId', userId)
      if (email) params.append('email', email)

      const response = await fetch(`/api/subscribe/keywords?${params}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: `"${keywordText}" 키워드 구독이 취소되었습니다.`,
        })
        loadSubscriptions() // 목록 새로고침
      } else {
        const data = await response.json()
        toast({
          title: "오류",
          description: data.error || "구독 취소에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("키워드 구독 취소 실패:", error)
      toast({
        title: "오류",
        description: "구독 취소 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  // 키워드 검색으로 이동
  const handleKeywordClick = (keywordText) => {
    window.location.href = `/search?q=${encodeURIComponent(keywordText)}`
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          키워드 구독
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 구독 추가 폼 */}
        <div className="flex gap-2">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="구독할 키워드를 입력하세요"
            onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
            className="flex-1"
          />
          <Button 
            onClick={handleSubscribe}
            disabled={isLoading('subscribe') || !keyword.trim()}
            className="flex items-center gap-1"
          >
            {isLoading('subscribe') ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Plus className="w-4 h-4" />
            )}
            구독
          </Button>
        </div>

        {/* 구독 목록 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            구독 중인 키워드 ({subscriptions.length})
          </h4>
          
          {isLoading('list') ? (
            <CenterLoading text="구독 목록을 불러오는 중..." />
          ) : subscriptions.length > 0 ? (
            <div className="space-y-2">
              {subscriptions.map((subscription) => (
                <div 
                  key={subscription.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => handleKeywordClick(subscription.keyword)}
                    >
                      {subscription.keyword}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(subscription.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnsubscribe(subscription.id, subscription.keyword)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">구독 중인 키워드가 없습니다.</p>
              <p className="text-xs">관심 있는 키워드를 구독하면 관련 뉴스를 받아볼 수 있습니다.</p>
            </div>
          )}
        </div>

        {/* 구독 안내 */}
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 구독 혜택</p>
          <ul className="space-y-1">
            <li>• 관심 키워드 관련 뉴스 알림</li>
            <li>• 실시간 트렌드 업데이트</li>
            <li>• 맞춤형 뉴스 추천</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
