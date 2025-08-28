import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";

import { UserProvider, useUser } from "@/contexts/UserContext";
import { AppShell } from "@/components/AppShell";
import { LoginScreen } from "@/components/LoginScreen";
import { WelcomeDialog } from "@/components/WelcomeDialog";

import HomePage from "@/pages/HomePage";
import ScalesPage from "@/pages/ScalesPage";
import IntervalsPage from "@/pages/IntervalsPage";
import IntervalPracticePage from "@/pages/IntervalPracticePage";
import ProgressPage from "@/pages/ProgressPage";
import LearningJourneyPage from "@/pages/LearningJourneyPage";
import LessonPage from "@/pages/LessonPage";
import NotFound from "@/pages/not-found";

function Router() {
  const { currentUser, isLoadingUser } = useUser();
  const [showWelcome, setShowWelcome] = useState(false);

  // Check if user has seen welcome screen
  useEffect(() => {
    if (currentUser) {
      const welcomeSeen = localStorage.getItem(`welcome-seen-${currentUser.id}`);
      if (!welcomeSeen) {
        setShowWelcome(true);
      }
    }
  }, [currentUser]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell>
      <WelcomeDialog 
        open={showWelcome} 
        onClose={() => setShowWelcome(false)} 
      />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/scales" component={ScalesPage} />
        <Route path="/intervals" component={IntervalsPage} />
        <Route path="/interval-practice" component={IntervalPracticePage} />
        <Route path="/progress" component={ProgressPage} />
        <Route path="/learning-journey" component={LearningJourneyPage} />
        <Route path="/lesson/:stepId/:section" component={LessonPage} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;