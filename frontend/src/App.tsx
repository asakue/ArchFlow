import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layouts/MainLayout";
import Dashboard from "@/pages/dashboard";
import Templates from "@/pages/templates";
import Artifacts from "@/pages/artifacts";
import Design from "@/pages/design";
import Approval from "@/pages/approval";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { PageLoader } from "./components/ui/loader"; // Added import for PageLoader
import { useState, useEffect } from 'react'; //Corrected import statement


function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/templates" component={Templates} />
      <ProtectedRoute path="/artifacts" component={Artifacts} />
      <ProtectedRoute path="/design" component={Design} />
      <ProtectedRoute path="/approval" component={Approval} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/settings" component={Settings} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate app loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {loading && <PageLoader />} {/* Added PageLoader component */}
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;