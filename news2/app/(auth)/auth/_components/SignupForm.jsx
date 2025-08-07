"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, User, Heart } from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/lib/config";

/**
 * 회원가입 폼 컴포넌트
 * - 이름, 이메일, 비밀번호 입력받아 회원가입 처리
 * - 관심사 선택 기능 (최대 3개 제한)
 * - 약관 동의 및 뉴스레터 구독 옵션 제공
 */
export default function SignupForm() {
  const router = useRouter();
  // 사용자가 선택한 관심사 목록 상태 관리
  const [selectedInterests, setSelectedInterests] = useState([]);

  // 사용자가 선택할 수 있는 관심사 카테고리 목록
  const interests = [
    { id: "politics", label: "정치", icon: "🏛️" },
    { id: "economy", label: "경제", icon: "💰" },
    { id: "society", label: "사회", icon: "👥" },
    { id: "it", label: "IT/과학", icon: "💻" },
    { id: "sports", label: "스포츠", icon: "⚽" },
    { id: "culture", label: "문화", icon: "🎭" },
    { id: "international", label: "국제", icon: "🌍" },
    { id: "entertainment", label: "연예", icon: "🎬" },
  ];

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    newsletter: false,
    terms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);

  /**
   * 관심사 선택/해제 토글 함수
   * @param {string} interestId - 선택/해제할 관심사 ID
   *
   * 동작 방식:
   * - 이미 선택된 항목: 제거
   * - 새로운 항목: 3개 제한 확인 후 추가
   */
  const toggleInterest = (interestId) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interestId)) {
        // 이미 선택된 항목이면 제거
        return prev.filter((id) => id !== interestId);
      } else {
        // 새로 선택하는 경우 3개 제한 확인 후 추가
        if (prev.length >= 3) {
          return prev; // 3개 이상이면 추가하지 않음
        }
        return [...prev, interestId];
      }
    });
  };

  /**
   * 회원가입 및 뉴스레터 구독 처리
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 회원가입 API 호출
      const registerRes = await fetch(getApiUrl('auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          newsletter: formData.newsletter
        }),
      });

      const registerData = await registerRes.json();

      if (registerRes.ok) {
        console.log('회원가입 완료:', registerData);
        
        // 뉴스레터 구독이 체크된 경우 구독 처리
        if (formData.newsletter && formData.email) {
          const subscribeRes = await fetch(getApiUrl('subscribe'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: formData.email }),
          });

          if (subscribeRes.ok) {
            console.log('뉴스레터 구독 완료:', formData.email);
            setShowRedirectMessage(true);
            
            // 안내 메시지 3초 후 제거
            setTimeout(() => {
              setShowRedirectMessage(false);
            }, 3000);
          }
        }

        // 회원가입 성공 후 로그인 페이지로 이동
        router.push('/auth');
      } else {
        setError(registerData.message || '회원가입에 실패했습니다.');
      }
      
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
      console.error('회원가입 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
        <CardDescription>
          새 계정을 만들어 개인 맞춤 뉴스 서비스를 시작하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit}>
          {/* 이름 입력 필드 */}
          <div className="space-y-2">
            <Label htmlFor="signup-name">이름</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="signup-name"
                placeholder="이름을 입력하세요"
                className="pl-10"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* 이메일 입력 필드 */}
          <div className="space-y-2">
            <Label htmlFor="signup-email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="signup-email"
                type="email"
                placeholder="이메일을 입력하세요"
                className="pl-10"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* 비밀번호 입력 필드 */}
          <div className="space-y-2">
            <Label htmlFor="signup-password">비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="signup-password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                className="pl-10"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
          </div>

        {/* 관심사 선택 섹션 */}
        <div className="space-y-3 mt-2">
          <Label className="flex items-center justify-between">
            <span className="flex items-center">
              <Heart className="h-4 w-4 mr-2 text-red-500" />
              관심 분야 선택 (선택사항)
            </span>
            {/* 선택된 관심사 개수 표시 (최대 3개) */}
            <span className="text-xs text-gray-500">
              {selectedInterests.length}/3
            </span>
          </Label>

          {/* 관심사 선택 그리드 */}
          <div className="grid grid-cols-2 gap-2">
            {interests.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              const isDisabled = !isSelected && selectedInterests.length >= 3;

              return (
                <div
                  key={interest.id}
                  onClick={() => !isDisabled && toggleInterest(interest.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50" // 선택된 상태
                      : isDisabled
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50" // 비활성화 상태
                      : "border-gray-200 hover:border-gray-300 cursor-pointer" // 선택 가능 상태
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">{interest.icon}</div>
                    <div className="text-sm font-medium">{interest.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

          {/* 약관 동의 섹션 */}
          <div className="space-y-3 mb-2 mt-2">
            {/* 뉴스레터 구독 동의 */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="newsletter" 
                checked={formData.newsletter}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, newsletter: checked }))}
              />
              <Label htmlFor="newsletter" className="text-sm">
                뉴스레터 구독 (매일 아침 맞춤 뉴스 받기)
              </Label>
            </div>

            {/* 이용약관 및 개인정보처리방침 동의 */}
            <div className="flex items-center space-x-2 ">
              <Checkbox 
                id="terms" 
                checked={formData.terms}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, terms: checked }))}
                required
              />
              <Label htmlFor="terms" className="text-sm">
                <Link href="/terms" className="text-blue-600 hover:underline">
                  이용약관
                </Link>{" "}
                및{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  개인정보처리방침
                </Link>
                에 동의합니다
              </Label>
            </div>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 회원가입 버튼 */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : '회원가입'}
          </Button>
          
          {/* 뉴스레터 구독 안내 메시지 */}
          {showRedirectMessage && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                ✅ 뉴스레터 구독이 완료되었습니다!
              </p>
              <p className="text-xs text-blue-600 mt-1 animate-fade-in">
                로그인 후 뉴스레터 서비스를 이용하실 수 있습니다.
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
