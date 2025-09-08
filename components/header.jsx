'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import {
  Bell,
  Search,
  User,
  Menu,
  Bookmark,
  Share2,
  Clock,
  Eye,
  LogOut,
  Shield,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getUserInfo, logout } from '@/lib/auth';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    // 초기 로드 시 사용자 상태 확인
    const updateUserStatus = () => {
      const currentUserInfo = getUserInfo();
      const currentUserRole =
        currentUserInfo?.role ||
        currentUserInfo?.userRole ||
        currentUserInfo?.authorities?.[0] ||
        currentUserInfo?.roles?.[0] ||
        (currentUserInfo ? 'user' : null);

      console.log('🔍 Header 상태 업데이트:', {
        userInfo: currentUserInfo,
        userRole: currentUserRole,
        localStorage: localStorage.getItem('userInfo'),
      });
      setUserInfo(currentUserInfo);
      setUserRole(currentUserRole);
    };

    updateUserStatus();

    // 커스텀 이벤트 감지 (로그인/로그아웃 시)
    const handleAuthChange = () => {
      console.log('🔍 AuthStateChanged 이벤트 감지');
      // 약간의 지연을 두고 상태 업데이트 (localStorage 저장 완료 대기)
      setTimeout(() => {
        updateUserStatus();
      }, 100);
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 에러가 발생해도 사용자 정보는 즉시 클리어
      setUserInfo(null);
      setUserRole(null);
    }
  };

  const navigation = [
    { name: '홈', href: '/' },
    { name: '뉴스레터', href: '/newsletter' },
    { name: '마이페이지', href: '/mypage' },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // 렌더링 시 현재 상태 로그
  console.log('🎨 Header 렌더링:', {
    userRole,
    userInfo,
    isLoggedIn: !!userRole,
  });

  return (
    <header className="sticky top-0 z-50 responsive-gradient glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 animate-slide-in">
              <h1 className="text-2xl font-logo font-bold text-white drop-shadow-lg animate-pulse-slow">
                NewSphere
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover-lift ${
                    isActive(item.href)
                      ? 'text-white bg-white/20 backdrop-blur-sm shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <SearchAutocomplete placeholder="뉴스 검색..." className="w-64" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {userRole ? (
                <div className="flex items-center space-x-2">
                  {/* 사용자 이름 표시 (선택사항) */}
                  {userInfo?.name && (
                    <span className="hidden lg:block text-white/90 text-sm font-medium">
                      {userInfo.name}님
                    </span>
                  )}

                  {userRole === 'admin' && (
                    <Link href="/admin">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 hover-glow"
                        title="관리자 페이지"
                      >
                        <Shield className="h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 hover-glow"
                    onClick={handleLogout}
                    title="로그아웃"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Link href="/auth" className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 hover-glow"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/20"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4 animate-slide-in">
            <div className="space-y-2">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <SearchAutocomplete placeholder="뉴스 검색..." className="w-full" />
              </div>

              {/* Mobile Navigation Links */}
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'text-white bg-white/20 backdrop-blur-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
