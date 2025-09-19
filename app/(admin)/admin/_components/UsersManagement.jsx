"use client"; // Next.js 13+에서 이 파일이 클라이언트 컴포넌트임을 선언

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { AlertTriangle } from "lucide-react";
import { authenticatedFetch } from "@/lib/auth/auth"; // 인증 토큰/리프레시를 처리해주는 fetch 래퍼

/** YYYY.MM.DD 형태로 한국형 날짜 포맷팅 */
function formatDateKR(value) {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return "정보 없음";
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function UsersManagement() {
  /** 서버에서 받아온 현재 페이지의 회원 목록 */
  const [users, setUsers] = useState([]);
  /** 데이터/네트워크 상태 */
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /** 페이지네이션 상태(서버 페이지 기준) */
  const [page, setPage] = useState(0); // 0-based
  const [size, setSize] = useState(10); // 페이지 크기
  const [total, setTotal] = useState(0); // 전체 회원 수
  const [isFirst, setIsFirst] = useState(true);
  const [isLast, setIsLast] = useState(true);

  /** 검색어 - 현재 페이지 내 클라이언트 필터(서버 검색 API 미확인 시 임시용) */
  const [q, setQ] = useState("");

  /** 현재 로그인 사용자(자기 자신 제외용) */
  const [me, setMe] = useState(null);

  /** 탈퇴 처리 진행 중인 사용자 id (버튼 비활성화/로딩 표시) */
  const [pendingId, setPendingId] = useState(null);

  /** 백엔드 엔드포인트 - Next.js API routes를 통한 프록시 사용 */
  const listUrl = `/api/users/admin`; // 쿠키 기반 인증으로 프록시
  const meUrl = `/api/users/mypage`; // 기존과 동일
  const deleteUrl = (id) => `/api/users/internal/admin/${id}`; // 쿠키 기반 인증으로 프록시

  /** 내 정보 조회(목록에서 자기 자신 제외를 위해 필요) */
  const fetchMe = useCallback(async () => {
    try {
      const res = await authenticatedFetch(meUrl);
      if (res?.ok) {
        const j = await res.json();
        // API 스키마: { success, data: { id, email, ... } } 가정
        setMe(j?.data ?? j ?? null);
      }
    } catch {
      // 내 정보 조회 실패 시에도 기능은 계속 동작(그냥 제외를 못할 뿐)
      setMe(null);
    }
  }, [meUrl]);

  /**
   * 회원 목록 조회
   * - 가정: authenticatedFetch는 성공 시 Response를 반환하고, 인증 실패 등은 throw 하도록 구현
   * - page/size 쿼리 사용(응답에 pageable 존재)
   */
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL(listUrl, window.location.origin);
      url.searchParams.set("page", String(page));
      url.searchParams.set("size", String(size));
      // 서버 정렬/검색이 지원되면 여기서 확장:
      // url.searchParams.set("sort", "createdAt,DESC");
      // if (q) url.searchParams.set("q", q);

      const res = await authenticatedFetch(url.toString());

      if (res?.success === false) {
        throw new Error(
          res?.message || "세션이 만료되었습니다. 다시 로그인해주세요."
        );
      }
      if (!res.ok) {
        let msg = "회원 목록을 불러오는데 실패했습니다.";
        try {
          const errJson = await res.json().catch(() => ({}));
          if (errJson?.message) msg = errJson.message;
        } catch {}
        throw new Error(msg);
      }

      const json = await res.json().catch(() => ({}));
      const payload = json?.data; // { content, totalElements, first, last, ... }

      setUsers(payload?.content ?? []);
      setTotal(payload?.totalElements ?? 0);
      setIsFirst(Boolean(payload?.first));
      setIsLast(Boolean(payload?.last));
    } catch (e) {
      console.error("Fetch Users Error:", e);
      setError(e?.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [listUrl, page, size]);

  /** 최초 & 페이지/사이즈 변경 시: 내 정보 + 회원 목록 병렬 로드 */
  useEffect(() => {
    fetchMe();
    fetchUsers();
  }, [fetchMe, fetchUsers]);

  /** 현재 페이지 내에서만 적용되는 간단 검색 + "내 계정 제외" 필터 */
  const filtered = useMemo(() => {
    const meId = me?.id;
    const meEmail = me?.email?.toLowerCase?.();

    // 1) 내 계정 제외
    let base = users.filter((u) => {
      if (meId != null) return u?.id !== meId;
      if (meEmail) return String(u?.email ?? "").toLowerCase() !== meEmail;
      return true; // me를 못 불러온 경우엔 제외 불가
    });

    // 2) 검색어 필터(현재 페이지 대상)
    if (!q) return base;
    const kw = q.toLowerCase();
    return base.filter((u) =>
      [u?.name, u?.email].some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(kw)
      )
    );
  }, [users, me, q]);

  // 총원 표시는 “내 계정 제외”를 반영해 보이기
  const totalExcludingMe = useMemo(() => {
    if (!me?.id && !me?.email) return total; // me를 모르면 그대로 노출
    // 서버 total에 내 계정이 포함되어 있다는 전제하에 -1 처리
    // (백엔드에서 excludeSelf 지원 시 서버 total 사용으로 바꾸는 것을 권장)
    return Math.max(0, total - 1);
  }, [total, me?.id, me?.email]);

  /** 회원 탈퇴 처리 */
  const deleteUser = useCallback(
    async (u) => {
      if (!u?.id) return;
      // 안전장치: 혹시라도 목록에 자기 자신이 보인다면 막기
      if (me?.id && u.id === me.id) {
        alert("자기 자신은 탈퇴 처리할 수 없습니다.");
        return;
      }
      const ok = window.confirm(
        `'${u?.name ?? u?.email ?? u.id}' 사용자를 탈퇴 처리할까요?`
      );
      if (!ok) return;

      setPendingId(u.id);
      try {
        const res = await authenticatedFetch(deleteUrl(u.id), {
          method: "DELETE",
        });

        // 백엔드 응답 스키마에 맞게 처리
        if (!res.ok) {
          let msg = "탈퇴 처리에 실패했습니다.";
          try {
            const j = await res.json();
            if (j?.message) msg = j.message;
          } catch {}
          throw new Error(msg);
        } else {
          // { success: true } 같은 스키마도 수용
          try {
            const j = await res.json();
            if (j?.success === false)
              throw new Error(j?.message || "탈퇴 처리에 실패했습니다.");
          } catch {
            // 바디가 없을 수도 있으니 무시
          }
        }

        // 성공: 현재 페이지 재조회
        await fetchUsers();
      } catch (e) {
        console.error("Delete User Error:", e);
        alert(e?.message || "탈퇴 처리 중 오류가 발생했습니다.");
      } finally {
        setPendingId(null);
      }
    },
    [me?.id, fetchUsers]
  );

  // -------------------- 상태별 분기 렌더링 --------------------

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">회원 관리</h2>
          <div className="flex space-x-2">
            <div className="w-64 h-10 animate-pulse bg-muted rounded" />
            <div className="w-24 h-10 animate-pulse bg-muted rounded" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>회원 목록</CardTitle>
            <CardDescription>로딩 중입니다…</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-full animate-pulse bg-muted rounded"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-red-50 border border-red-200 rounded-lg p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-red-700">오류 발생</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <Button onClick={fetchUsers} className="mt-4">
          다시 시도
        </Button>
      </div>
    );
  }
  // -------------------- 정상 화면 --------------------

  return (
    <div className="space-y-6">
      {/* 헤더 영역: 제목 / 검색 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-2xl font-bold">회원 관리</h2>
        <div className="flex gap-2">
          {/* 현재는 '해당 페이지 내' 클라이언트 필터임을 주석으로 명시 */}
          <Input
            placeholder="이름·이메일 검색… (현재 페이지에서만)"
            className="w-64"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>회원 목록</CardTitle>
          <CardDescription>
            전체 회원 정보를 관리하세요. 현재 총 <b>{totalExcludingMe}</b>명의
            회원이 있습니다.
            {/* 주의: 서버에서 excludeSelf 쿼리를 지원하면 이 계산은 서버 total로 대체하세요. */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((user) => {
                  const isActive =
                    String(user?.status ?? "").toUpperCase() === "ACTIVE";
                  const isDeleting = pendingId === user?.id;
                  return (
                    <TableRow key={user?.id}>
                      <TableCell className="font-medium">
                        {user?.name ?? "이름 없음"}
                      </TableCell>
                      <TableCell>{user?.email ?? "이메일 없음"}</TableCell>
                      <TableCell>{user?.role ?? "역할 없음"}</TableCell>
                      <TableCell>{isActive ? "활성" : "비활성"}</TableCell>
                      <TableCell>
                        {user?.createdAt
                          ? formatDateKR(user.createdAt)
                          : "가입일 없음"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive" // shadcn/ui 기준 파괴적 액션 스타일
                          disabled={isDeleting}
                          onClick={() => deleteUser(user)}
                        >
                          {isDeleting ? "처리 중…" : "탈퇴 처리"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* 수정된 페이지네이션 컨트롤 - 주석 해제하고 개선 */}
          <div className="flex items-center justify-between mt-6">
            {/* 왼쪽: 현재 페이지 정보 */}
            <div className="text-sm text-muted-foreground">
              페이지 {page + 1} / {Math.ceil(total / size)}
              <span className="ml-2">
                (총 {total}명 중 {page * size + 1}-
                {Math.min((page + 1) * size, total)}번째)
              </span>
            </div>

            {/* 오른쪽: 페이지네이션 버튼들 */}
            <div className="flex items-center gap-2">
              {/* 맨 처음으로 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(0)}
                disabled={isFirst || isLoading}
              >
                ««
              </Button>

              {/* 이전 페이지 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={isFirst || isLoading}
              >
                이전
              </Button>

              {/* 현재 페이지 번호 표시 (클릭 가능한 페이지들) */}
              {(() => {
                const totalPages = Math.ceil(total / size);
                const currentPage = page;
                const pageButtons = [];

                // 현재 페이지 주변 2개씩 보여주기
                const startPage = Math.max(0, currentPage - 2);
                const endPage = Math.min(totalPages - 1, currentPage + 2);

                for (let i = startPage; i <= endPage; i++) {
                  pageButtons.push(
                    <Button
                      key={i}
                      variant={i === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(i)}
                      disabled={isLoading}
                      className="min-w-[2.5rem]"
                    >
                      {i + 1}
                    </Button>
                  );
                }

                return pageButtons;
              })()}

              {/* 다음 페이지 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={isLast || isLoading}
              >
                다음
              </Button>

              {/* 맨 마지막으로 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.ceil(total / size) - 1)}
                disabled={isLast || isLoading}
              >
                »»
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
