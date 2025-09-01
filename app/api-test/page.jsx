"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getApiUrl } from "@/lib/config"
import { diagnoseCorsIssue, checkBackendHealth, checkNetworkConnectivity } from "@/lib/api-utils"


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
        data: response.ok ? await response.json().catch(() => ({})) : await response.text(),
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

  const runDiagnosis = async () => {
    setLoading(true)
    try {
      const result = await diagnoseCorsIssue()
      setDiagnosis(result)
    } catch (error) {
      console.error('진단 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    if (status === 200) return "bg-green-500"
    if (status >= 400) return "bg-red-500"
    return "bg-yellow-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      
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
              onClick={runDiagnosis}
              disabled={loading}
              variant="secondary"
            >
              {loading ? "진단 중..." : "연결 진단"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setTestResults({})
                setDiagnosis(null)
              }}
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

        {diagnosis && (
          <div className="mt-8">
            <Card className="glass">
              <CardHeader>
                <CardTitle>🔍 연결 진단 결과</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">🌐 네트워크 연결</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={diagnosis.networkConnectivity.isOnline ? "bg-green-500" : "bg-red-500"}>
                        {diagnosis.networkConnectivity.isOnline ? "온라인" : "오프라인"}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {diagnosis.networkConnectivity.isOnline 
                          ? `상태: ${diagnosis.networkConnectivity.status}`
                          : `오류: ${diagnosis.networkConnectivity.error}`
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">🔗 백엔드 서버</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={diagnosis.backendHealth.isConnected ? "bg-green-500" : "bg-red-500"}>
                        {diagnosis.backendHealth.isConnected ? "연결됨" : "연결 안됨"}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {diagnosis.backendHealth.isConnected 
                          ? `상태: ${diagnosis.backendHealth.status} - ${diagnosis.backendHealth.data}`
                          : `오류: ${diagnosis.backendHealth.error}`
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">⚙️ 환경 설정</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>NODE_ENV:</strong> {diagnosis.environment.NODE_ENV}</div>
                      <div><strong>API URL:</strong> {diagnosis.environment.NEXT_PUBLIC_API_URL || '설정되지 않음'}</div>
                      <div><strong>브라우저:</strong> {diagnosis.environment.isBrowser ? '예' : '아니오'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
