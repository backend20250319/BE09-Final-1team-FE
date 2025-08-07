"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Zap } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-logo font-bold mb-2">NewSphere</h2>
            <p className="text-gray-400">세상의 모든 소식, 한 곳에서.</p>
          </div>
          <div className="md:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold mb-4">서비스</h3>
                <ul className="space-y-2">
                  <li><Link href="/news" className="text-gray-400 hover:text-white">뉴스</Link></li>
                  <li><Link href="/community" className="text-gray-400 hover:text-white">커뮤니티</Link></li>
                  <li><Link href="/newsletter" className="text-gray-400 hover:text-white">뉴스레터</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">지원</h3>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-white">고객센터</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white">FAQ</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white">문의하기</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">법률</h3>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-white">이용약관</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white">개인정보처리방침</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">뉴스레터 구독</h3>
                <form className="flex flex-col space-y-2">
                  <Input type="email" placeholder="이메일 주소" className="bg-gray-800 border-gray-700 text-white" />
                  <Button type="submit" className="gradient-bg hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                    <Zap className="w-4 h-4 mr-2" />
                    구독하기
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">&copy; 2025 NewNews. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {/* Social media links can be added here */}
          </div>
        </div>
      </div>
    </footer>
  )
}
