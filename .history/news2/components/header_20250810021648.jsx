"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Zap,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { getUserRole, logout } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const { toast } = useToast();
  const pathname = usePathname();

  useEffect(() => {
    setUserRole(getUserRole());
  }, []);

  // 뉴스레터 구독 함수
  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    
    if (!newsletterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast({ 
        description: "올바른 이메일 주소를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    setNewsletterLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "구독 실패");
      }
      
      toast({ 
        description: "구독 확인 메일을 보냈어요. 메일함을 확인해 주세요.",
        variant: "default"
      });
      setNewsletterEmail("");
    } catch (err) {
      toast({ 
        description: err.message || "오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  const navigation = [
    { name: "홈", href: "/" },
    { name: "커뮤니티", href: "/community" },
    { name: "뉴스레터", href: "/newsletter" },
    { name: "마이페이지", href: "/mypage" },
  ];

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 responsive-gradient glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 animate-slide-in"
            >
              <h1 className="text-2xl font-logo font-bold text-white drop-shadow-lg animate-pulse-slow">
                NewNews
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
                      ? "text-white bg-white/20 backdrop-blur-sm shadow-lg"
                      : "text-white/80 hover:text-white hover:bg-white/10"
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
            {/* Newsletter Subscription */}
            <div className="hidden lg:flex items-center space-x-2">
              <form onSubmit={handleNewsletterSubscribe} className="flex items-center space-x-2">
                <Input 
                  type="email"
                  placeholder="뉴스레터 구독" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-48 h-9 bg-white/20 border-white/30 text-white placeholder-white/70 text-sm focus:bg-white/30 focus:border-white/50"
                  disabled={newsletterLoading}
                />
                <Button 
                  type="submit"
                  variant="outline" 
                  size="sm" 
                  className="h-9 border-white text-white hover:bg-white hover:text-purple-600 transition-all duration-200"
                  disabled={newsletterLoading}
                >
                  {newsletterLoading ? (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">처리중</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>구독</span>
                    </div>
                  )}
                </Button>
              </form>
            </div>

            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
              <Input
                placeholder="뉴스 검색..."
                className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover-glow text-white hover:bg-white/20"
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs floating-badge">
                  3
                </Badge>
              </Button>

              {userRole ? (
                <div className="flex items-center space-x-2">
                  {userRole === "admin" && (
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
                    onClick={logout}
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
              {/* Mobile Newsletter Subscription */}
              <div className="mb-4 p-3 bg-white/10 rounded-lg">
                <form onSubmit={handleNewsletterSubscribe} className="space-y-2">
                  <Input 
                    type="email"
                    placeholder="뉴스레터 구독" 
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full bg-white/20 border-white/30 text-white placeholder-white/70"
                    disabled={newsletterLoading}
                  />
                  <Button 
                    type="submit"
                    variant="outline" 
                    size="sm" 
                    className="w-full border-white text-white hover:bg-white hover:text-purple-600"
                    disabled={newsletterLoading}
                  >
                    {newsletterLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>처리 중...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>구독하기</span>
                      </div>
                    )}
                  </Button>
                </form>
              </div>

              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
                <Input
                  placeholder="뉴스 검색..."
                  className="pl-10 w-full bg-white/10 border-white/20 text-white placeholder-white/50"
                />
              </div>

              {/* Mobile Navigation Links */}
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? "text-white bg-white/20 backdrop-blur-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
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

