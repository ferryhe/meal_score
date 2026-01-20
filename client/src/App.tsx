import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Members from "@/pages/Members";
import Entry from "@/pages/Entry";
import Stats from "@/pages/Stats";
import History from "@/pages/History";
import { useStore } from "@/lib/store";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/members" component={Members} />
        <Route path="/" component={Entry} />
        <Route path="/stats" component={Stats} />
        <Route path="/history" component={History} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const loadData = useStore((state) => state.loadData);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
