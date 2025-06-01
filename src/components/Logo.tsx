import { ShieldCheck } from 'lucide-react';
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends SVGProps<SVGSVGElement> {
  iconOnly?: boolean;
}

export function Logo({ iconOnly = false, className, ...props }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <ShieldCheck className={cn("h-8 w-8 text-primary", className)} {...props} />
      {!iconOnly && (
        <span className="text-2xl font-bold text-foreground">
          Item<span className="text-primary">Retriever</span>
        </span>
      )}
    </div>
  );
}