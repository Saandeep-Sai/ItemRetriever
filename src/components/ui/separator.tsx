"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    variant?: "default" | "dashed" | "gradient";
  }
>(({ className, orientation = "horizontal", decorative = true, variant = "default", ...props }, ref) => {
  const variantStyles = {
    default: "bg-gray-200 dark:bg-gray-700",
    dashed: "bg-gray-200 dark:bg-gray-700 border-dashed border-t-2 border-gray-200 dark:border-gray-700",
    gradient: "bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent",
  };

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0",
        orientation === "horizontal" ? "h-[2px] w-full" : "h-full w-[2px]",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
});
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };