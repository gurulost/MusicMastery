import { ReactNode } from "react";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen bg-background">
      <TopBar />
      <main className="relative">
        <div className="container max-w-6xl mx-auto px-6">
          {children}
        </div>
      </main>
    </div>
  );
}