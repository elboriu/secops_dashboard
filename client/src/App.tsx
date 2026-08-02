import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Overview from "./pages/Overview";
import SecurityCenter from "./pages/SecurityCenter";
import RealtimeMonitor from "./pages/RealtimeMonitor";
import RiskManagement from "./pages/RiskManagement";
import Analytics from "./pages/Analytics";
import AccessControl from "./pages/AccessControl";
import PolicyEngine from "./pages/PolicyEngine";
import Configuration from "./pages/Configuration";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Overview} />
      <Route path="/security-center" component={SecurityCenter} />
      <Route path="/realtime-monitor" component={RealtimeMonitor} />
      <Route path="/risk-management" component={RiskManagement} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/access-control" component={AccessControl} />
      <Route path="/policy-engine" component={PolicyEngine} />
      <Route path="/configuration" component={Configuration} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <DashboardLayout>
            <Router />
          </DashboardLayout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
