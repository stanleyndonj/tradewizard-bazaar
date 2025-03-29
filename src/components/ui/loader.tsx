
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function Loader({ size = 'md', text, className, ...props }: LoaderProps) {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)} {...props}>
      <Loader2 className={cn("animate-spin text-trading-blue", sizeMap[size])} />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export function FullPageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center w-full">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-t-trading-blue border-b-trading-blue border-l-transparent border-r-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-trading-blue animate-spin" />
            </div>
          </div>
        </div>
        <p className="text-trading-charcoal font-medium">{text}</p>
      </div>
    </div>
  );
}
