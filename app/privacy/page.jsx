"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      
      
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              개인정보처리방침
            </CardTitle>
            <p className="text-sm text-gray-500 text-center">
              최종 업데이트: 2024년 12월
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold mb-3">1. 개인정보의 처리 목적</h2>
              <p className="text-gray-700 mb-3">
                뉴스 서비스(이하 "서비스")는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 
                다음의 목적 이외의 용도로는 이용하지 않습니다.
              </p>
              <div className="space-y-2 text-gray-700">
                <p>• 회원가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 만14세 미만 아동 개인정보 수집 시 법정 대리인 동의여부 확인, 각종 고지·통지, 고충처리 목적으로 개인정보를 처리합니다.</p>
                <p>• 서비스 제공: 뉴스 콘텐츠 제공, 개인화 추천, 뉴스레터 발송, 댓글 서비스, 스크랩 기능 등 서비스 제공 목적으로 개인정보를 처리합니다.</p>
                <p>• 마케팅 및 광고에의 활용: 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공, 서비스의 유효성 확인, 접속빈도 파악 또는 회원의 서비스 이용에 대한 통계 목적으로 개인정보를 처리합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. 개인정보의 처리 및 보유기간</h2>
              <div className="space-y-2 text-gray-700">
                <p>① 서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
                <p>② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.</p>
                <div className="ml-4 space-y-1">
                  <p>• 회원가입 및 관리: 서비스 이용계약 또는 회원가입 해지시까지</p>
                  <p>• 서비스 제공: 서비스 이용계약 또는 회원가입 해지시까지</p>
                  <p>• 마케팅 및 광고: 회원가입 해지시까지</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. 개인정보의 제3자 제공</h2>
              <div className="space-y-2 text-gray-700">
                <p>① 서비스는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
                <p>② 서비스는 다음과 같은 경우에 개인정보를 제3자에게 제공할 수 있습니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>정보주체로부터 별도의 동의를 받은 경우</li>
                  <li>법령에 근거하여 정부기관으로부터 요청받은 경우</li>
                  <li>통계작성 및 학술연구 등의 목적을 위하여 특정 개인을 알아볼 수 없는 형태로 가공하여 제공하는 경우</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. 개인정보처리의 위탁</h2>
              <div className="space-y-2 text-gray-700">
                <p>① 서비스는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
                <div className="ml-4 space-y-1">
                  <p>• 위탁받는 자 (수탁자): 클라우드 서비스 제공업체</p>
                  <p>• 위탁하는 업무의 내용: 서버 호스팅 및 데이터 저장</p>
                  <p>• 위탁기간: 서비스 제공 기간</p>
                </div>
                <p>② 위탁계약 체결시 개인정보보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. 정보주체의 권리·의무 및 그 행사방법</h2>
              <div className="space-y-2 text-gray-700">
                <p>① 정보주체는 서비스에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>개인정보 열람요구</li>
                  <li>오류 등이 있을 경우 정정 요구</li>
                  <li>삭제요구</li>
                  <li>처리정지 요구</li>
                </ul>
                <p>② 제1항에 따른 권리 행사는 서비스에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 서비스는 이에 대해 지체 없이 조치하겠습니다.</p>
                <p>③ 정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. 처리하는 개인정보의 항목</h2>
              <div className="space-y-2 text-gray-700">
                <p>서비스는 다음의 개인정보 항목을 처리하고 있습니다.</p>
                <div className="ml-4 space-y-1">
                  <p>• 필수항목: 이메일 주소, 비밀번호, 이름, 출생연도, 성별</p>
                  <p>• 선택항목: 관심사, 뉴스레터 구독 여부</p>
                  <p>• 자동수집항목: IP 주소, 쿠키, 서비스 이용 기록, 접속 로그</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. 개인정보의 파기</h2>
              <div className="space-y-2 text-gray-700">
                <p>① 서비스는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
                <p>② 개인정보 파기의 절차 및 방법은 다음과 같습니다.</p>
                <div className="ml-4 space-y-1">
                  <p>• 파기절차: 불필요한 개인정보 및 개인정보파일은 개인정보보호책임자의 승인을 받아 파기</p>
                  <p>• 파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. 개인정보의 안전성 확보 조치</h2>
              <div className="space-y-2 text-gray-700">
                <p>서비스는 개인정보보호법 제29조에 따라 다음과 같은 안전성 확보 조치를 취하고 있습니다.</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>개인정보의 암호화: 이용자의 개인정보는 비밀번호는 암호화되어 저장 및 관리되고 있어, 본인만이 알 수 있으며 중요한 데이터는 파일 및 전송 데이터를 암호화하여 사용하는 등의 별도 보안기능을 통해 보호하고 있습니다.</li>
                  <li>해킹 등에 대비한 기술적 대책: 서비스는 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안프로그램을 설치하고 주기적인 갱신·점검을 하며 외부로부터 접근이 통제된 구역에 시스템을 설치하고 기술적/물리적으로 감시 및 차단하고 있습니다.</li>
                  <li>개인정보에 대한 접근 제한: 개인정보를 처리하는 데이터베이스시스템에 대한 접근권한의 부여, 변경, 말소를 통하여 개인정보에 대한 접근통제를 위하여 필요한 조치를 하고 있으며 침입차단시스템을 이용하여 외부로부터의 무단 접근을 통제하고 있습니다.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">9. 개인정보 보호책임자</h2>
              <div className="space-y-2 text-gray-700">
                <p>① 서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
                <div className="ml-4 space-y-1">
                  <p>• 개인정보 보호책임자</p>
                  <p>• 연락처: privacy@newsservice.com</p>
                </div>
                <p>② 정보주체께서는 서비스의 서비스(또는 사업)을 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 문의하실 수 있습니다. 서비스는 정보주체의 문의에 대해 지체 없이 답변 및 처리해드릴 것입니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">10. 개인정보 처리방침 변경</h2>
              <div className="space-y-2 text-gray-700">
                <p>① 이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
                <p>② 이 개인정보처리방침은 2024년 12월 1일부터 적용됩니다.</p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-xs text-gray-500">
                본 개인정보처리방침은 2024년 12월 1일부터 시행됩니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
