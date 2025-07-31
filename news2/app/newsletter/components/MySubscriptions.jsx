
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { TextWithTooltips } from "@/components/tooltip";

export default function MySubscriptions({ subscribedNewsletters, handleSubscribe }) {
  return (
    <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.3s' }}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Bell className="h-5 w-5 mr-2 text-blue-500" />
          내 구독
        </CardTitle>
        <CardDescription>
          현재 구독 중인 뉴스레터 ({subscribedNewsletters.length}개)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {subscribedNewsletters.map((newsletter) => (
            <div key={newsletter.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300">
              <div className="flex-1">
                <h4 className="font-medium text-sm">
                  <TextWithTooltips text={newsletter.title} />
                </h4>
                <p className="text-xs text-gray-500">{newsletter.frequency}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSubscribe(newsletter.id)}
                className="hover-glow"
              >
                구독해제
              </Button>
            </div>
          ))}
          {subscribedNewsletters.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              구독 중인 뉴스레터가 없습니다
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
