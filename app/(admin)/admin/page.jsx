'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import UsersManagement from './_components/UsersManagement';
import NewsletterManagement from './_components/NewsletterManagement';
import AdminSettings from './_components/AdminSettings';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            <TabsTrigger value="users">회원 관리</TabsTrigger>
            <TabsTrigger value="newsletter">뉴스레터</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          {/* <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent> */}

          {/* Users Management Tab */}
          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          {/* Newsletter Tab */}
          <TabsContent value="newsletter">
            <NewsletterManagement />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
