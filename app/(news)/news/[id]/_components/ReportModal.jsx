// 기사 신고 기능을 제공하는 모달 컴포넌트
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authenticatedFetch } from "@/lib/auth/auth";
import { toast } from 'sonner';

const reportReasons = [
  { id: "FAKE_NEWS", label: "허위 정보 / 가짜뉴스" },
  { id: "SPAM", label: "광고 / 스팸" },
  { id: "HATE_SPEECH", label: "욕설 / 혐오 발언" },
  { id: "COPYRIGHT", label: "저작권 침해" },
  { id: "OTHER", label: "기타" },
];

const ReportModal = ({ isOpen, onClose, newsId }) => {
  const [reason, setReason] = useState(reportReasons[0].id);
  const [details, setDetails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleReportClick = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);

    try {
      const response = await authenticatedFetch(`/api/news/${newsId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason, details }),
      });

      if (response.ok) {
        toast.success("기사가 정상적으로 신고되었습니다.");
        onClose();
      } else {
        const errorText = await response.text();
        toast.error(errorText || "신고 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error during report:", error);
      toast.error(error.message || "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>기사 신고하기</DialogTitle>
            <DialogDescription>
              신고하려는 이유를 선택해주세요. 허위 신고 시 서비스 이용에 제한을
              받을 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <RadioGroup
              defaultValue={reason}
              onValueChange={setReason}
              className="space-y-2"
            >
              {reportReasons.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={item.id} id={`reason-${item.id}`} />
                  <Label htmlFor={`reason-${item.id}`}>{item.label}</Label>
                </div>
              ))}
            </RadioGroup>
            {reason === "OTHER" && (
              <Textarea
                placeholder="상세한 신고 내용을 입력해주세요."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                취소
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReportClick}
              disabled={isLoading}
            >
              {"신고하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>신고 확인</DialogTitle>
            <DialogDescription>정말 신고하시겠습니까?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              아니오
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmSubmit}
              disabled={isLoading}
            >
              예
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportModal;
