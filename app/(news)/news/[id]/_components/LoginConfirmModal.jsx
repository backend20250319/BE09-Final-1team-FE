// 로그인이 필요한 기능에 사용되는 확인 모달 컴포넌트
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn } from 'lucide-react';

const LoginConfirmModal = ({ isOpen, onClose }) => {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push("/auth");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <LogIn className="mr-2 h-5 w-5" />
            로그인 필요
          </DialogTitle>
          <DialogDescription>
            스크랩 기능을 사용하려면 로그인이 필요합니다. 로그인하시면 관심있는 뉴스를 저장하고 나중에 다시 볼 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <button
            type="button"
            onClick={handleLoginRedirect}
            className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            style={{
              background:
                "linear-gradient(135deg, rgba(102, 126, 234, 1) 0%, rgba(118, 75, 162, 1) 50%, rgba(245, 87, 108, 1) 100%)",
            }}
          >
            로그인
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginConfirmModal;
