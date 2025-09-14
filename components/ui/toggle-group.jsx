"use client";
import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils/utils";
import { toggleVariants } from "@/components/ui/toggle";

// Context 생성, 초기값 하드코딩 (size/variant는 string)
const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
});

const ToggleGroup = React.forwardRef(function ToggleGroup(
  { className, variant, size, children, ...props },
  ref
) {
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      className={cn("flex items-center justify-center gap-1", className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
});
ToggleGroup.displayName = "ToggleGroup";

const ToggleGroupItem = React.forwardRef(function ToggleGroupItem(
  { className, children, variant, size, ...props },
  ref
) {
  const context = React.useContext(ToggleGroupContext);
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
