export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* 히어로/트렌딩 자리 고정 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[560px] rounded-xl bg-white/60 animate-pulse" />
          <div className="space-y-4">
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
