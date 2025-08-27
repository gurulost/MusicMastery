import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/HomePage";
import ScalesPage from "@/pages/ScalesPage";
import IntervalsPage from "@/pages/IntervalsPage";
import IntervalPracticePage from "@/pages/IntervalPracticePage";
import ProgressPage from "@/pages/ProgressPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/scales" component={ScalesPage} />
      <Route path="/intervals" component={IntervalsPage} />
      <Route path="/interval-practice" component={IntervalPracticePage} />
      <Route path="/progress" component={ProgressPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
