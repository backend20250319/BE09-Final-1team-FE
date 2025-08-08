"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Mail, CheckCircle, XCircle } from "lucide-react";

export default function UsersManagement() {
  const users = [
    {
      id: 1,
      name: "김사용자",
      email: "user1@example.com",
      joinDate: "2024-01-10",
      status: "active",
      newsletter: true,
    },
    {
      id: 2,
      name: "이회원",
      email: "user2@example.com",
      joinDate: "2024-01-12",
      status: "active",
      newsletter: false,
    },
    {
      id: 3,
      name: "박구독자",
      email: "user3@example.com",
      joinDate: "2024-01-13",
      status: "inactive",
      newsletter: true,
    },
    {
      id: 4,
      name: "최독자",
      email: "user4@example.com",
      joinDate: "2024-01-14",
      status: "active",
      newsletter: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">회원 관리</h2>
        <div className="flex space-x-2">
          <Input placeholder="회원 검색..." className="w-64" />
          <Button variant="outline">내보내기</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>회원 목록</CardTitle>
          <CardDescription>전체 회원 정보를 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>뉴스레터</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "default" : "secondary"
                      }
                    >
                      {user.status === "active" ? "활성" : "비활성"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.newsletter ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
