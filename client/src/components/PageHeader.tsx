import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col gap-6 px-6 py-8 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{subtitle}</p>
          )}
        </div>
        {children && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}