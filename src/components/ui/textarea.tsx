import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea"> & {
    variant?: "default" | "outline" | "filled";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = {
    default: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800",
    outline: "border-2 border-blue-500 dark:border-blue-400 bg-transparent",
    filled: "border-none bg-gray-100 dark:bg-gray-700",
  };

  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-lg px-4 py-3 text-base",
        "transition-all duration-200",
        "placeholder:text-gray-400 dark:placeholder:text-gray-500",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };