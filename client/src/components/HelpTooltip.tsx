import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger, 
  TooltipProvider 
} from "@/components/ui/tooltip";

interface HelpTooltipProps {
  content: string;
  onClick?: () => void;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function HelpTooltip({ content, onClick, className, side = "top" }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 text-muted-foreground hover:text-foreground ${className}`}
            onClick={onClick}
            data-testid="help-tooltip-button"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Help</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
          {onClick && (
            <p className="text-xs text-muted-foreground mt-1">
              Click for detailed help
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}