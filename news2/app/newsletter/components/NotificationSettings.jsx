
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function NotificationSettings() {
  return (
    <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.4s' }}>
      <CardHeader>
        <CardTitle className="text-lg">알림 설정</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="text-sm">
              이메일 알림
            </Label>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications" className="text-sm">
              푸시 알림
            </Label>
            <Switch id="push-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="weekly-digest" className="text-sm">
              주간 요약
            </Label>
            <Switch id="weekly-digest" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
