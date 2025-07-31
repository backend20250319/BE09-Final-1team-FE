"use client";

import { useState } from "react";
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
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
              <Link href="/auth" className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 hover-glow"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>

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