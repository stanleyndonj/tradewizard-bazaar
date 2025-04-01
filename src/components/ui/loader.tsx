
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

// New trading-specific loader
export function TradingLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center w-full p-8">
      <div className="flex flex-col items-center space-y-6">
        {/* Candlestick animation */}
        <div className="relative flex items-end h-20 space-x-2">
          <div className="w-4 bg-green-500 h-10 animate-pulse relative">
            <div className="absolute top-0 bottom-0 w-0.5 left-1/2 transform -translate-x-1/2 h-14 bg-green-500"></div>
          </div>
          <div className="w-4 bg-red-500 h-16 animate-pulse relative">
            <div className="absolute top-0 bottom-0 w-0.5 left-1/2 transform -translate-x-1/2 h-20 bg-red-500"></div>
          </div>
          <div className="w-4 bg-green-500 h-12 animate-pulse relative">
            <div className="absolute top-0 bottom-0 w-0.5 left-1/2 transform -translate-x-1/2 h-16 bg-green-500"></div>
          </div>
          <div className="w-4 bg-green-500 h-14 animate-pulse relative">
            <div className="absolute top-0 bottom-0 w-0.5 left-1/2 transform -translate-x-1/2 h-18 bg-green-500"></div>
          </div>
          <div className="w-4 bg-red-500 h-8 animate-pulse relative">
            <div className="absolute top-0 bottom-0 w-0.5 left-1/2 transform -translate-x-1/2 h-12 bg-red-500"></div>
          </div>
        </div>
        
        {/* Trading circle animation */}
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-trading-blue border-l-trading-green border-r-trading-red animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
              <div className="text-trading-blue text-xl font-bold">FX</div>
            </div>
          </div>
        </div>
        
        {/* Line chart animation */}
        <div className="w-40 h-10 relative overflow-hidden">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
            <path 
              d="M0,15 L10,10 L20,20 L30,5 L40,15 L50,10 L60,5 L70,15 L80,10 L90,20 L100,15" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="text-trading-blue animate-pulse"
            />
          </svg>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white to-transparent"></div>
        </div>
        
        <p className="text-trading-charcoal font-semibold mt-4">{text}</p>
      </div>
    </div>
  );
}
