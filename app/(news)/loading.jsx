import { Suspense } from "react"
import { Skeleton, PageFrameSkeleton  } from "@/components/ui/skeleton"
                                    

export default function Loading() {
  return (
    <PageFrameSkeleton>
      <Skeleton />
    </PageFrameSkeleton>
  )
}
