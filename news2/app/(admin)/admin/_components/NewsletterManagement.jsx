"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";

export default function NewsletterManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">뉴스레터 관리</h2>
        <div className="flex space-x-2">
          <Button
            onClick={() =>
              (window.location.href = "/admin/newsletter/dashboard")
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            뉴스레터 대시보드
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              (window.location.href = "/admin/newsletter/template")
            }
          >
            템플릿 관리
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              (window.location.href = "/admin/newsletter/settings")
            }
          >
            설정
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">총 구독자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8,901</div>
            <p className="text-sm text-muted-foreground">+15% 이번 달</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">평균 오픈율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">68.5%</div>
            <p className="text-sm text-muted-foreground">+2.3% 이번 달</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">평균 클릭율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12.8%</div>
            <p className="text-sm text-muted-foreground">+1.2% 이번 달</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>발송 예약</CardTitle>
          <CardDescription>예약된 뉴스레터 발송 목록</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">주간 뉴스 요약</h4>
                <p className="text-sm text-muted-foreground">
                  매주 월요일 오전 8시 발송
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge>활성</Badge>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">일간 뉴스 브리핑</h4>
                <p className="text-sm text-muted-foreground">
                  매일 오전 7시 발송
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge>활성</Badge>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
