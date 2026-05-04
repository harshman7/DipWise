import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Compare from "./pages/Compare";
import DipBacktester from "./pages/DipBacktester";
import Portfolio from "./pages/Portfolio";
import Watchlist from "./pages/Watchlist";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/backtester" element={<DipBacktester />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}
