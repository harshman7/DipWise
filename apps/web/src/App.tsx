import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import RequireAuth from "./components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import Compare from "./pages/Compare";
import DipBacktester from "./pages/DipBacktester";
import Portfolio from "./pages/Portfolio";
import Watchlist from "./pages/Watchlist";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/backtester" element={<DipBacktester />} />
        <Route path="/reports" element={<Reports />} />
        <Route element={<RequireAuth />}>
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/alerts" element={<Alerts />} />
        </Route>
      </Route>
    </Routes>
  );
}
