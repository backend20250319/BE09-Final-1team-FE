"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"

export default function TermTooltip({ term, definition, children }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <span
        className="inline-flex items-center cursor-help border-b border-dashed border-blue-400 text-blue-600 hover:text-blue-800 transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        <Info className="h-3 w-3 ml-1" />
      </span>
      
      {isVisible && (
        <div className="absolute z-50 mt-2 w-64 animate-slide-in">
          <Card className="glass shadow-xl border-blue-200">
            <CardContent className="p-3">
              <div className="text-sm">
                <div className="font-semibold text-blue-800 mb-1">{term}</div>
                <div className="text-gray-600 text-xs leading-relaxed">{definition}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 