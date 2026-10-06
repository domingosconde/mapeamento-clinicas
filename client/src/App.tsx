import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

const ClinicDetail = lazy(() => import("./pages/ClinicDetail"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const BookAppointment = lazy(() => import("./pages/BookAppointment"));
const Setup = lazy(() => import("./pages/Setup"));
const Welcome = lazy(() => import("./pages/Welcome"));
const AppointmentsHistory = lazy(() => import("./pages/AppointmentsHistory"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function RouteFallback() {
  return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground" role="status">A carregar…</div>;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path={"/welcome"} component={Welcome} />
        <Route path={"/"} component={Home} />
        <Route path={"/clinic/:id"} component={ClinicDetail} />
        <Route path={"/clinic/:id/book"} component={BookAppointment} />
        <Route path={"/appointments"} component={AppointmentsHistory} />
        <Route path={"/admin"} component={AdminDashboard} />
        <Route path={"/setup"} component={Setup} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
