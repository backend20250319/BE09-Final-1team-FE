"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedSubscribeForm from "./EnhancedSubscribeForm";
import AlternativeSubscriptionOptions from "./AlternativeSubscriptionOptions";
import KakaoPermissionModal from "./KakaoPermissionModal";
import KakaoPermissionDebug from "./KakaoPermissionDebug";
import { 
  MessageCircle, 
  Mail, 
  Bell, 
  Settings,
  Info,
  CheckCircle,
  AlertCircle,
  Bug
} from "lucide-react";

export default function NewsletterSubscriptionDemo() {
  const [selectedCategory, setSelectedCategory] = useState("정치");
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showAlternativeOptions, setShowAlternativeOptions] = useState(false);

  const categories = [
    "정치", "경제", "사회", "생활", "세계", 
    "IT/과학", "자동차/교통", "여행/음식", "예술"
  ];

  const handleSubscribeSuccess = (email, subscriptionData) => {
    console.log('구독 성공:', { email, subscriptionData });
  };

  const handlePermissionConfirm = () => {
    setShowPermissionModal(false);
    console.log('카카오 권한 허용');
  };

  const handleAlternativeOption = () => {
    setShowPermissionModal(false);
    setShowAlternativeOptions(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          📱 카카오톡 뉴스레터 구독 시스템
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          사용자 친화적인 권한 처리와 대체 옵션을 제공하는 뉴스레터 구독 시스템
        </p>
        
        {/* 카테고리 선택 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <Tabs defaultValue="subscribe" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subscribe">구독하기</TabsTrigger>
          <TabsTrigger value="alternatives">대체 옵션</TabsTrigger>
          <TabsTrigger value="features">주요 기능</TabsTrigger>
          <TabsTrigger value="debug">디버그</TabsTrigger>
        </TabsList>

        {/* 구독 폼 탭 */}
        <TabsContent value="subscribe" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-yellow-600" />
                {selectedCategory} 뉴스레터 구독
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedSubscribeForm
                category={selectedCategory}
                onSubscribeSuccess={handleSubscribeSuccess}
                showKakaoOption={true}
              />
            </CardContent>
          </Card>

          {/* 권한 요청 모달 테스트 */}
          <Card>
            <CardHeader>
              <CardTitle>권한 요청 모달 테스트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  카카오톡 메시지 권한 요청 모달을 테스트해보세요.
                </p>
                <Button 
                  onClick={() => setShowPermissionModal(true)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  권한 요청 모달 열기
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 대체 옵션 탭 */}
        <TabsContent value="alternatives" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                대체 구독 방법
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AlternativeSubscriptionOptions
                category={selectedCategory}
                onEmailSubscribe={handleSubscribeSuccess}
                onWebPushSubscribe={() => console.log('웹 푸시 구독')}
                onRssSubscribe={(url) => console.log('RSS 구독:', url)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 주요 기능 탭 */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 이용 중 동의 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  이용 중 동의
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="secondary">추천 방식</Badge>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• 로그인 시 부담을 줄여 가입률 향상</li>
                    <li>• 실제 필요한 시점에만 권한 요청</li>
                    <li>• 사용자가 서비스를 체험한 후 동의 여부 결정</li>
                    <li>• 권한 거부 시에도 대체 방법 제공</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 사용자 친화적 UI */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  사용자 친화적 UI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="outline">UX 최적화</Badge>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• 명확한 권한 안내와 혜택 설명</li>
                    <li>• 권한 상태를 시각적으로 표시</li>
                    <li>• 언제든지 설정에서 변경 가능</li>
                    <li>• 에러 처리 및 재시도 로직</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 대체 옵션 제공 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-purple-600" />
                  대체 옵션 제공
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="outline">다양한 선택지</Badge>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• 이메일 뉴스레터 구독</li>
                    <li>• 웹 푸시 알림</li>
                    <li>• RSS 피드 제공</li>
                    <li>• 모바일 앱 (준비 중)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 에러 처리 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  에러 처리
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="outline">안정성</Badge>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• 권한 거부 시 대체 방법 안내</li>
                    <li>• 네트워크 오류 시 재시도 로직</li>
                    <li>• 사용자 친화적 에러 메시지</li>
                    <li>• 로그 및 모니터링</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 구현 가이드 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Info className="h-5 w-5" />
                구현 가이드
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">1. 권한 확인 및 요청</h4>
                  <code className="text-sm bg-white p-2 rounded border block">
                    const {`{ hasPermission, requestPermissionFlow }`} = useKakaoPermission();
                  </code>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">2. 구독 폼 사용</h4>
                  <code className="text-sm bg-white p-2 rounded border block">
                    {`<EnhancedSubscribeForm category="정치" onSubscribeSuccess={handleSuccess} />`}
                  </code>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">3. 대체 옵션 제공</h4>
                  <code className="text-sm bg-white p-2 rounded border block">
                    {`<AlternativeSubscriptionOptions category="정치" />`}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 디버그 탭 */}
        <TabsContent value="debug" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-orange-600" />
                카카오 권한 디버그
              </CardTitle>
            </CardHeader>
            <CardContent>
              <KakaoPermissionDebug />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 권한 요청 모달 */}
      <KakaoPermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onConfirm={handlePermissionConfirm}
        onAlternative={handleAlternativeOption}
        category={selectedCategory}
        isLoading={false}
      />
    </div>
  );
}
