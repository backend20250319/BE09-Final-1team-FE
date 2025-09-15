"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef(({ className, theme = "default", ...props }, ref) => {
  let themeClass = "";
  if (theme === "hot") themeClass = "bg-[#ffd93d] text-gray-800 px-2 py-1 rounded-full text-sm";
  if (theme === "category-selected") themeClass = "bg-[#6366f1] text-white border border-[#6366f1] px-3 py-1 rounded-lg";
  if (theme === "category") themeClass = "border border-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-[#6366f1] hover:text-white transition";
  if (theme === "keyword") themeClass = "text-[#6366f1] font-bold";
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants(), themeClass, className)}
      {...props}
    />
  );
});
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
