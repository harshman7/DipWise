import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
          <footer className="mt-12 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
            DipWise is for educational and historical backtesting purposes only.
            This is not financial advice.
          </footer>
        </main>
      </div>
    </div>
  );
}
