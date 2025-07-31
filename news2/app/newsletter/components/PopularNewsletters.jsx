
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { TextWithTooltips } from "@/components/tooltip";

export default function PopularNewsletters({ newsletters }) {
  return (
    <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.5s' }}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
          인기 뉴스레터
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {newsletters
            .sort((a, b) => b.subscribers - a.subscribers)
            .slice(0, 5)
            .map((newsletter, index) => (
              <div key={newsletter.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 transition-all duration-300">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium">
                      <TextWithTooltips text={newsletter.title} />
                    </p>
                    <p className="text-xs text-gray-500">{newsletter.subscribers.toLocaleString()} 구독자</p>
                  </div>
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
