import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";

function NotFound() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404 - Página Não Encontrada</h1>
      <a href="/">Voltar para o Início</a>
    </div>
  );
}

function Home() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Aplicação Rodando com Sucesso!</h1>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  );
}
