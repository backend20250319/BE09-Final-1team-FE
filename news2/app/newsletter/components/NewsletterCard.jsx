
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, Clock, Star } from "lucide-react";
import { TextWithTooltips } from "@/components/tooltip";

export default function NewsletterCard({ newsletter, isLoaded, index, subscribedNewsletters, handleSubscribe }) {
  return (
    <Card 
      key={newsletter.id} 
      className={`glass hover-lift animate-slide-in ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ animationDelay: `${(index + 1) * 0.1}s` }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">
                {newsletter.category}
              </Badge>
              <Badge className="bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow">
                {newsletter.frequency}
              </Badge>
            </div>
            <CardTitle className="text-lg mb-2">
              <TextWithTooltips text={newsletter.title} />
            </CardTitle>
            <CardDescription className="line-clamp-2">
              <TextWithTooltips text={newsletter.description} />
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={subscribedNewsletters.some(nl => nl.id === newsletter.id)}
              onCheckedChange={() => handleSubscribe(newsletter.id)}
            />
            <Label className="text-xs">구독</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {newsletter.tags.map((tag) => (
            <Badge key={tag} className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow">
              #{tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{newsletter.subscribers.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{newsletter.lastSent}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3" />
            <span>4.8</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
