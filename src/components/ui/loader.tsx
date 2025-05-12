
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradingLoaderProps {
  text?: string;
  small?: boolean;
}

export const TradingLoader: React.FC<TradingLoaderProps> = ({ text, small = false }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center", small ? "space-y-1" : "space-y-3")}>
      <Loader2 className={cn(
        "animate-spin text-trading-blue",
        small ? "h-4 w-4" : "h-8 w-8"
      )} />
      {text && (
        <p className={cn(
          "text-muted-foreground",
          small ? "text-xs" : "text-sm"
        )}>
          {text}
        </p>
      )}
    </div>
  );
};

export default TradingLoader;
