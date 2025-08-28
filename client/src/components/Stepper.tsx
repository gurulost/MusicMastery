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
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex items-center">
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
              
              {/* Step Label */}
              <div className="ml-3 hidden sm:block">
                <p
                  className={cn(
                    "text-sm font-medium transition-colors",
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
                  "flex-1 h-0.5 mx-4 transition-colors duration-200",
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