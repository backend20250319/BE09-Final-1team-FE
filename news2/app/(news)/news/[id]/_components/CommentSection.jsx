"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from "sonner";

const CommentSection = ({ newsId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '방문자', avatar: 'https://placehold.co/40x40/E2E8F0/4A5568?text=?' });

  useEffect(() => {
    // 컴포넌트가 로드될 때, 로컬 스토리지에서 토큰과 사용자 정보를 확인
    const token = localStorage.getItem('accessToken');
    const storedUserInfo = localStorage.getItem('userInfo');

    if (token && storedUserInfo) {
      setIsLoggedIn(true);
      const parsedInfo = JSON.parse(storedUserInfo);
      setUserInfo({
        name: parsedInfo.name || '사용자',
        avatar: `https://placehold.co/40x40/C7D2FE/4338CA?text=${parsedInfo.name?.[0] || 'U'}`
      });
    } else {
      setIsLoggedIn(false);
    }

    // TODO: 다음 단계에서 실제 댓글 목록을 불러오는 API 호출 로직이 여기에 추가해야됨.

  }, [newsId]); // newsId가 바뀔 때마다 댓글을 다시 불러와야 함.

  const handleCommentSubmit = () => {
    if (!isLoggedIn) {
      toast.error("댓글을 작성하려면 로그인이 필요합니다.");
      return;
    }
    if (newComment.trim() === "") {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }

    // TODO: 다음 단계에서 실제 백엔드 API로 댓글을 전송하는 로직으로 교체.
    // 현재는 프론트엔드에만 임시로 추가.
    const comment = {
      id: Date.now(),
      author: userInfo.name,
      avatar: userInfo.avatar,
      text: newComment,
      time: "방금 전",
    };
    setComments([comment, ...comments]);
    setNewComment("");
    toast.success("댓글이 등록되었습니다. (임시)");
  };

  return (
    <section className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-6">
        댓글{" "}
        <span className="text-indigo-600">{comments.length}</span>
      </h2>
      <div className="space-y-6">
        {/*로그인 상태에 따라 다른 UI 설정*/}
        {isLoggedIn ? (
          <div className="flex items-start gap-4">
            <img
              src={userInfo.avatar}
              alt={`${userInfo.name} 프로필`}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <textarea
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                rows="3"
                placeholder={`의견을 남겨보세요, ${userInfo.name}님...`}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
              />
              <button
                onClick={handleCommentSubmit}
                className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors float-right"
              >
                등록
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 border-2 border-dashed rounded-lg bg-gray-50">
            <p className="text-gray-600 mb-4">댓글을 작성하려면 로그인이 필요합니다.</p>
            <Link href="/auth">
              <span className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors cursor-pointer">
                로그인 페이지로 이동
              </span>
            </Link>
          </div>
        )}

        <div className="space-y-6 pt-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-4">
              <img
                src={comment.avatar}
                alt={`${comment.author} 프로필`}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">{comment.author}</p>
                <p className="text-gray-700 mt-1">{comment.text}</p>
                <p className="text-xs text-gray-500 mt-2">{comment.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommentSection;
