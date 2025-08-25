"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, ThumbsUp, Reply, MoreHorizontal, Send } from "lucide-react"

export default function CommentSection({ newsId }) {
  const [comments, setComments] = useState([
    {
      id: 1,
      author: {
        name: "김철수",
        avatar: "/placeholder-user.jpg",
        level: "레벨 5"
      },
      content: "정말 흥미로운 기사네요! AI 기술이 우리 일자리에 미치는 영향에 대해 더 자세히 알고 싶습니다.",
      createdAt: "2시간 전",
      likes: 12,
      replies: 3,
      isLiked: false
    },
    {
      id: 2,
      author: {
        name: "이영희",
        avatar: "/placeholder-user.jpg",
        level: "레벨 3"
      },
      content: "기술 발전은 좋지만 일자리 문제가 걱정됩니다. 정부의 대책이 필요할 것 같아요.",
      createdAt: "1시간 전",
      likes: 8,
      replies: 1,
      isLiked: true
    }
  ])

  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState(null)

  const handleSubmitComment = () => {
    if (!newComment.trim()) return

    const comment = {
      id: Date.now(),
      author: {
        name: "사용자",
        avatar: "/placeholder-user.jpg",
        level: "레벨 1"
      },
      content: newComment,
      createdAt: "방금 전",
      likes: 0,
      replies: 0,
      isLiked: false
    }

    setComments(prev => [comment, ...prev])
    setNewComment("")
  }

  const handleLike = (commentId) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              isLiked: !comment.isLiked 
            }
          : comment
      )
    )
  }

  const handleReply = (commentId) => {
    setReplyTo(replyTo === commentId ? null : commentId)
  }

  return (
    <Card className="glass hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
          댓글 ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 댓글 작성 */}
        <div className="mb-6">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>사용자</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="댓글을 작성하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] bg-white/50 border-gray-200"
              />
              <div className="flex justify-end mt-2">
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className="flex items-center space-x-1"
                >
                  <Send className="h-4 w-4" />
                  댓글 작성
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.avatar} />
                  <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-sm">{comment.author.name}</span>
                    <Badge className="text-xs bg-blue-100 text-blue-600">
                      {comment.author.level}
                    </Badge>
                    <span className="text-xs text-gray-500">{comment.createdAt}</span>
                  </div>
                  <p className="text-gray-700 mb-3">{comment.content}</p>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center space-x-1 ${
                        comment.isLiked ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{comment.likes}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReply(comment.id)}
                      className="flex items-center space-x-1 text-gray-500"
                    >
                      <Reply className="h-4 w-4" />
                      <span className="text-sm">답글</span>
                    </Button>
                    {comment.replies > 0 && (
                      <span className="text-sm text-gray-500">
                        답글 {comment.replies}개
                      </span>
                    )}
                  </div>
                  
                  {/* 답글 작성 영역 */}
                  {replyTo === comment.id && (
                    <div className="mt-3 ml-4">
                      <div className="flex space-x-2">
                        <Textarea
                          placeholder="답글을 작성하세요..."
                          className="min-h-[60px] bg-white/50 border-gray-200 text-sm"
                        />
                        <Button size="sm" className="self-end">
                          답글
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 