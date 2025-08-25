"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-16">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              접근 권한이 없습니다
            </CardTitle>
            <CardDescription className="text-gray-600">
              이 페이지에 접근할 권한이 없습니다. 관리자에게 문의하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-500">
              <p>• 관리자 계정으로 로그인해주세요</p>
              <p>• 권한이 필요한 경우 관리자에게 문의하세요</p>
            </div>
            <div className="flex flex-col space-y-2">
              <Button onClick={() => router.push("/")} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                홈으로 돌아가기
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                이전 페이지로
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
