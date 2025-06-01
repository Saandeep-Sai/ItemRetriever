import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "pulse" | "shimmer";
}) {
  const variantStyles = {
    default: "bg-gray-200 dark:bg-gray-700",
    pulse: "bg-gray-200 dark:bg-gray-700 animate-pulse",
    shimmer:
      "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-[length:200%_100%]",
  };

  return (
    <div
      className={cn(
        "rounded-xl",
        variantStyles[props.variant || "default"],
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };