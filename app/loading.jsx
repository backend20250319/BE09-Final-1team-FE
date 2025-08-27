export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* 카테고리 탭과 실시간 키워드 자리 */}
        <div className="mb-2">
          <div className="grid grid-cols-12 gap-4 items-stretch mb-2">
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-2 h-full">
              {/* 카테고리 버튼 스켈레톤 */}
              <div className="lg:w-full overflow-x-auto flex space-x-3 pb-0">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-10 w-20 bg-white/60 rounded-lg animate-pulse flex-shrink-0" />
                ))}
              </div>
              {/* 실시간 키워드 스켈레톤 */}
              <div className="lg:w-auto">
                <div className="h-10 rounded-lg bg-white/60 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* 히어로/트렌딩 자리 고정 */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="w-full lg:w-2/3">
            <div className="h-[560px] rounded-xl bg-white/60 animate-pulse" />
          </div>
          <div className="w-full lg:w-1/3 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[130px] rounded-xl bg-white/60 animate-pulse" />
            ))}
          </div>
        </div>

        {/* 리스트 자리 고정 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[500px] rounded-xl bg-white/60 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
