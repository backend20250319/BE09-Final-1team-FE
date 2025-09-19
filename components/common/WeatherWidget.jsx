"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer } from "lucide-react"

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 날씨 아이콘 매핑
  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case '맑음':
      case 'clear':
        return <Sun className="h-6 w-6 text-yellow-500" />
      case '흐림':
      case 'cloudy':
        return <Cloud className="h-6 w-6 text-gray-500" />
      case '비':
      case 'rain':
        return <CloudRain className="h-6 w-6 text-blue-500" />
      case '눈':
      case 'snow':
        return <CloudSnow className="h-6 w-6 text-blue-300" />
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />
    }
  }

  // 날씨 데이터 가져오기
  const fetchWeather = async () => {
    try {
      setLoading(true)
      setError(null)

      // 실제 API 호출 시 이 부분을 수정
      // const response = await fetch(`/api/weather?city=Seoul`)
      // const data = await response.json()
      
      // 실제 API 호출
      const response = await fetch(`/api/weather?city=Seoul`)
      const data = await response.json().catch(() => ({}))
      
      if (!response.ok) {
        throw new Error(data.message || `날씨 정보를 가져올 수 없습니다. (${response.status})`)
      }
      
      setWeather(data)
    } catch (err) {
      console.error('날씨 데이터 가져오기 실패:', err)
      setError('날씨 정보를 가져올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
    
    // 30분마다 날씨 정보 업데이트
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="glass hover-lift animate-slide-in">
        <CardHeader className="pb-0.5">
          <CardTitle className="text-sm">오늘의 날씨</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-5 w-5 bg-gray-300 rounded mx-auto mb-1"></div>
              <div className="h-4 bg-gray-300 rounded w-10 mx-auto mb-1"></div>
              <div className="h-2 bg-gray-300 rounded w-12 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass hover-lift animate-slide-in">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">오늘의 날씨</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center text-red-500">
            <Cloud className="h-5 w-5 mx-auto mb-1" />
            <p className="text-xs">{error}</p>
            <button 
              onClick={fetchWeather}
              className="mt-1 text-xs text-blue-500 hover:underline"
            >
              다시 시도
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass hover-lift animate-slide-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          오늘의 날씨
          <Badge className="text-xs bg-green-100 text-green-600">
            실시간
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-center">
          {/* 메인 날씨 정보 */}
          <div className="mb-2">
            {getWeatherIcon(weather.condition)}
            <div className="text-xl font-bold text-blue-600 mt-1">
              {weather.temperature}°C
            </div>
            <div className="text-xs text-gray-600">{weather.condition}</div>
          </div>

          {/* 간소화된 상세 정보 */}
          <div className="flex justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <Thermometer className="h-3 w-3 text-red-500" />
              <span>체감 {weather.feelsLike}°C</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wind className="h-3 w-3 text-blue-500" />
              <span>{weather.windSpeed}m/s</span>
            </div>
          </div>

          {/* 자외선 지수 */}
          <div className="mt-1">
            <Badge 
              className={`text-xs ${
                weather.uvIndex <= 2 ? 'bg-green-100 text-green-600' :
                weather.uvIndex <= 5 ? 'bg-yellow-100 text-yellow-600' :
                weather.uvIndex <= 7 ? 'bg-orange-100 text-orange-600' :
                'bg-red-100 text-red-600'
              }`}
            >
              자외선 {weather.uvIndex}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 날씨 API 서비스 (실제 연동 시 사용)
import { config } from '@/lib/config'

export class WeatherService {
  constructor() {
    this.apiKey = config.external.weatherApiKey
    this.baseUrl = 'https://api.openweathermap.org/data/2.5'
  }

  async getWeather(city = 'Seoul') {
    try {
      const response = await fetch(
        `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=kr`
      )
      
      if (!response.ok) {
        throw new Error('날씨 데이터를 가져올 수 없습니다.')
      }

      const data = await response.json()
      
      return {
        temperature: Math.round(data.main.temp),
        condition: this.translateWeatherCondition(data.weather[0].main),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        location: data.name,
        feelsLike: Math.round(data.main.feels_like),
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // km로 변환
        uvIndex: 5, // 별도 API 필요
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      }
    } catch (error) {
      console.error('날씨 API 호출 실패:', error)
      throw error
    }
  }

  translateWeatherCondition(condition) {
    const conditions = {
      'Clear': '맑음',
      'Clouds': '흐림',
      'Rain': '비',
      'Snow': '눈',
      'Thunderstorm': '천둥번개',
      'Drizzle': '이슬비',
      'Mist': '안개',
      'Smoke': '연기',
      'Haze': '연무',
      'Dust': '먼지',
      'Fog': '안개',
      'Sand': '모래',
      'Ash': '재',
      'Squall': '돌풍',
      'Tornado': '토네이도'
    }
    
    return conditions[condition] || condition
  }
} 