"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      
      
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              이용약관
            </CardTitle>
            <p className="text-sm text-gray-500 text-center">
              최종 업데이트: 2024년 12월
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold mb-3">제1조 (목적)</h2>
              <p className="text-gray-700">
                본 약관은 뉴스 서비스(이하 "서비스")의 이용과 관련하여 서비스 제공자와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">제2조 (정의)</h2>
              <div className="space-y-2 text-gray-700">
                <p>1. "서비스"란 뉴스 콘텐츠 제공, 개인화 추천, 뉴스레터 발송 등을 포함한 모든 서비스를 의미합니다.</p>
                <p>2. "이용자"란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 의미합니다.</p>
                <p>3. "회원"이란 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스의 정보를 지속적으로 제공받으며, 서비스를 계속적으로 이용할 수 있는 자를 의미합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">제3조 (약관의 효력 및 변경)</h2>
              <div className="space-y-2 text-gray-700">
                <p>1. 본 약관은 서비스 이용을 신청한 이용자에 대하여 그 신청 시부터 효력이 발생합니다.</p>
                <p>2. 서비스 제공자는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</p>
                <p>3. 약관이 변경되는 경우, 변경사항을 시행일자 7일 전부터 서비스 내 공지사항을 통해 공지합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">제4조 (서비스의 제공)</h2>
              <div className="space-y-2 text-gray-700">
                <p>1. 서비스 제공자는 다음과 같은 서비스를 제공합니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>뉴스 콘텐츠 제공 및 검색</li>
                  <li>개인화된 뉴스 추천</li>
                  <li>뉴스레터 발송</li>
                  <li>뉴스 스크랩 및 북마크</li>
                  <li>댓글 및 소셜 기능</li>
                </ul>
                <p>2. 서비스의 구체적인 내용은 서비스 제공자가 정하는 바에 따라 제공됩니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">제5조 (서비스 이용)</h2>
              <div className="space-y-2 text-gray-700">
                <p>1. 이용자는 서비스를 이용함에 있어 다음 각 호의 행위를 하여서는 안 됩니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>타인의 개인정보를 무단으로 수집, 저장, 공개하는 행위</li>
                  <li>서비스의 정상적인 운영을 방해하는 행위</li>
                  <li>음란, 폭력, 기타 공서양속에 반하는 정보를 유통하는 행위</li>
                  <li>타인의 지적재산권을 침해하는 행위</li>
                </ul>
                <p>2. 이용자는 서비스 이용 중 발생한 모든 책임을 부담합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">제6조 (개인정보보호)</h2>
              <p className="text-gray-700">
                서비스 제공자는 이용자의 개인정보를 보호하기 위해 개인정보처리방침을 수립하고 이를 준수합니다. 
                개인정보의 수집, 이용, 제공 등에 관한 자세한 내용은 개인정보처리방침을 통해 확인하실 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">제7조 (서비스 제공의 중단)</h2>
              <div className="space-y-2 text-gray-700">
                <p>1. 서비스 제공자는 다음 각 호의 경우 서비스 제공을 중단할 수 있습니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>서비스 설비의 점검, 보수 또는 공사로 인한 부득이한 경우</li>
                  <li>전기통신사업법에 규정된 기간통신사업자가 전기통신 서비스를 중지했을 경우</li>
                  <li>기타 불가항력적 사유가 있는 경우</li>
                </ul>
                <p>2. 서비스 제공자는 서비스 중단 시 사전에 공지합니다. 단, 긴급한 경우 사후 공지할 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">제8조 (면책조항)</h2>
              <div className="space-y-2 text-gray-700">
                <p>1. 서비스 제공자는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
                <p>2. 서비스 제공자는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
                <p>3. 서비스 제공자는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">제9조 (분쟁해결)</h2>
              <div className="space-y-2 text-gray-700">
                <p>1. 서비스 이용과 관련하여 발생한 분쟁에 대해 서비스 제공자와 이용자는 성실히 협의하여 해결합니다.</p>
                <p>2. 협의가 이루어지지 않을 경우, 관련 법령 및 상관례에 따릅니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">제10조 (준거법 및 관할법원)</h2>
              <div className="space-y-2 text-gray-700">
                <p>1. 본 약관은 대한민국 법률에 따라 규율되고 해석됩니다.</p>
                <p>2. 서비스 이용으로 발생한 분쟁에 대해 소송이 필요할 경우, 서비스 제공자의 본사 소재지를 관할하는 법원을 관할법원으로 합니다.</p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-xs text-gray-500">
                본 약관은 2024년 12월 1일부터 시행됩니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
