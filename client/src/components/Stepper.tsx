import { CheckCircle, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  status: "completed" | "current" | "upcoming" | "locked";
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Mobile: Vertical Layout */}
      <div className="sm:hidden space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 flex-shrink-0",
                {
                  "bg-success text-success-foreground border-success": step.status === "completed",
                  "bg-primary text-primary-foreground border-primary": step.status === "current",
                  "bg-muted text-muted-foreground border-muted": step.status === "upcoming",
                  "bg-muted/50 text-muted-foreground border-muted/50": step.status === "locked",
                }
              )}
            >
              {step.status === "completed" ? (
                <CheckCircle className="w-4 h-4" />
              ) : step.status === "locked" ? (
                <Lock className="w-3 h-3" />
              ) : (
                <span className="text-xs font-bold">{step.id}</span>
              )}
            </div>
            <p
              className={cn(
                "text-sm font-medium transition-colors truncate",
                {
                  "text-success": step.status === "completed",
                  "text-primary": step.status === "current",
                  "text-foreground": step.status === "upcoming",
                  "text-muted-foreground": step.status === "locked",
                }
              )}
            >
              {step.title}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop: Horizontal Layout */}
      <div className="hidden sm:flex items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                  {
                    "bg-success text-success-foreground border-success": step.status === "completed",
                    "bg-primary text-primary-foreground border-primary": step.status === "current",
                    "bg-muted text-muted-foreground border-muted": step.status === "upcoming",
                    "bg-muted/50 text-muted-foreground border-muted/50": step.status === "locked",
                  }
                )}
              >
                {step.status === "completed" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : step.status === "locked" ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-bold">{step.id}</span>
                )}
              </div>
              
              {/* Step Label - positioned below circle */}
              <div className="mt-2 max-w-[120px]">
                <p
                  className={cn(
                    "text-xs font-medium transition-colors text-center leading-tight",
                    {
                      "text-success": step.status === "completed",
                      "text-primary": step.status === "current",
                      "text-foreground": step.status === "upcoming",
                      "text-muted-foreground": step.status === "locked",
                    }
                  )}
                >
                  {step.title}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 lg:mx-4 transition-colors duration-200",
                  step.status === "completed" ? "bg-success" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}