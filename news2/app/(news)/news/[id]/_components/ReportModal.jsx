'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const reportReasons = [
  { id: 'FAKE_NEWS', label: '허위 정보 / 가짜뉴스' },
  { id: 'SPAM', label: '광고 / 스팸' },
  { id: 'HATE_SPEECH', label: '욕설 / 혐오 발언' },
  { id: 'COPYRIGHT', label: '저작권 침해' },
  { id: 'OTHER', label: '기타' },
];

export default function ReportModal({ isOpen, onClose, newsId }) {
  const [reason, setReason] = useState(reportReasons[0].id);
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!window.confirm('정말 신고하시겠습니까?')) {
      return;
    }

    setIsLoading(true);

    try {
      const authToken = localStorage.getItem('accessToken');
      const response = await fetch(`/api/news/${newsId}/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, details }),
      });

      if (response.ok) {
        toast.success('기사가 정상적으로 신고되었습니다.');
        onClose(); // 모달 닫기
      } else {
        const errorData = await response.json().catch(() => ({ message: '서버 응답을 파싱할 수 없습니다.' }));
        toast.error(errorData.message || '신고 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error during report:', error);
      toast.error('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>기사 신고하기</DialogTitle>
            <DialogDescription>
              신고하려는 이유를 선택해주세요. 허위 신고 시 서비스 이용에 제한을 받을 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <RadioGroup defaultValue={reason} onValueChange={setReason} className="space-y-2">
              {reportReasons.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={item.id} id={`reason-${item.id}`} />
                    <Label htmlFor={`reason-${item.id}`}>{item.label}</Label>
                  </div>
              ))}
            </RadioGroup>
            {reason === 'OTHER' && (
                <Textarea placeholder="상세한 신고 내용을 입력해주세요." value={details} onChange={(e) => setDetails(e.target.value)} />
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">취소</Button>
            </DialogClose>
            <Button type="button" onClick={handleSubmit} disabled={isLoading}>
              {"신고하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}