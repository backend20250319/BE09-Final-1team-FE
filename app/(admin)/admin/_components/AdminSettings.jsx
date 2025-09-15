// AdminSettings
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">시스템 설정</h2>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          설정 저장
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>일반 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="site-name">사이트 이름</Label>
              <Input id="site-name" defaultValue="NewSphere" />
            </div>
            <div>
              <Label htmlFor="admin-email">관리자 이메일</Label>
              <Input id="admin-email" defaultValue="admin@newsphere.com" />
            </div>
            <div>
              <Label htmlFor="site-url">사이트 URL</Label>
              <Input id="site-url" defaultValue="https://newsphere.com" />
            </div>
            <Button>저장</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>보안 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>2단계 인증</Label>
                <p className="text-sm text-gray-500">관리자 계정에 2단계 인증 적용</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>세션 타임아웃</Label>
                <p className="text-sm text-gray-500">자동 로그아웃 시간 설정</p>
              </div>
              <Select defaultValue="8">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4시간</SelectItem>
                  <SelectItem value="8">8시간</SelectItem>
                  <SelectItem value="24">24시간</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">보안 로그 보기</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
