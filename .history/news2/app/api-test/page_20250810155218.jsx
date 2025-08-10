"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getApiUrl } from "@/lib/config"
import { diagnoseCorsIssue, checkBackendHealth, checkNetworkConnectivity } from "@/lib/api-utils"
import Header from "@/components/header"

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [diagnosis, setDiagnosis] = useState(null)

  const apiTests = [
    {
      name: "헬스 체크",
      endpoint: "/api/news/health",
      method: "GET"
    },
    {
      name: "데이터베이스 테스트",
      endpoint: "/api/news/test-db",
      method: "GET"
    },
    {
      name: "뉴스 개수",
      endpoint: "/api/news/count",
      method: "GET"
    },
    {
      name: "카테고리 목록",
      endpoint: "/api/news/categories",
      method: "GET"
    },
    {
      name: "전체 뉴스",
      endpoint: "/api/news",
      method: "GET"
    },
    {
      name: "트렌딩 뉴스",
      endpoint: "/api/news/trending",
      method: "GET"
    },
    {
      name: "최신 뉴스",
      endpoint: "/api/news/latest",
      method: "GET"
    },
    {
      name: "인기 뉴스",
      endpoint: "/api/news/popular",
      method: "GET"
    }
  ]

  const runTest = async (test) => {
    setLoading(true)
    try {
      const response = await fetch(getApiUrl(test.endpoint), {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = {
        status: response.status,
        ok: response.ok,
        data: response.ok ? await response.json() : await response.text(),
        timestamp: new Date().toISOString()
      }

      setTestResults(prev => ({
        ...prev,
        [test.name]: result
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [test.name]: {
          status: 'ERROR',
          ok: false,
          data: error.message,
          timestamp: new Date().toISOString()
        }
      }))
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    for (const test of apiTests) {
      await runTest(test)
      // 각 테스트 사이에 약간의 딜레이
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    setLoading(false)
  }

  const getStatusColor = (status) => {
    if (status === 200) return "bg-green-500"
    if (status >= 400) return "bg-red-500"
    return "bg-yellow-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">백엔드 API 테스트</h1>
          <p className="text-gray-600 mb-4">
            백엔드 API 연결 상태를 확인하고 테스트할 수 있습니다.
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={runAllTests} 
              disabled={loading}
              className="gradient-bg"
            >
              {loading ? "테스트 중..." : "모든 테스트 실행"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setTestResults({})}
            >
              결과 초기화
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apiTests.map((test) => (
            <Card key={test.name} className="glass hover-lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{test.method}</Badge>
                    <Button
                      size="sm"
                      onClick={() => runTest(test)}
                      disabled={loading}
                    >
                      테스트
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 mb-2">
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {test.endpoint}
                  </code>
                </div>
                
                {testResults[test.name] && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(testResults[test.name].status)}>
                        {testResults[test.name].status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {testResults[test.name].timestamp}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                        {typeof testResults[test.name].data === 'object' 
                          ? JSON.stringify(testResults[test.name].data, null, 2)
                          : testResults[test.name].data
                        }
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Card className="glass">
            <CardHeader>
              <CardTitle>API 설정 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>API Base URL:</strong> {getApiUrl('')}
                </div>
                <div>
                  <strong>환경:</strong> {process.env.NODE_ENV}
                </div>
                <div>
                  <strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || '설정되지 않음'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
