import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Fornecedores from "./pages/Fornecedores";

export default function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/fornecedores" component={Fornecedores} />
          <Route path="/404" component={NotFound} />
          {/* Final fallback route */}
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </ErrorBoundary>
  );
}
