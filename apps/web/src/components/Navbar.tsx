import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-gray-200 bg-white px-6">
      <Link to="/" className="text-lg font-bold text-brand-700 tracking-tight">
        DipWise
      </Link>
      <span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700 uppercase">
        Beta
      </span>
      <div className="ml-auto flex items-center gap-4 text-sm text-gray-500">
        {user ? (
          <>
            <span className="text-gray-700">{user.email}</span>
            <Button variant="ghost" size="sm" type="button" onClick={() => logout()}>
              Sign out
            </Button>
          </>
        ) : (
          <Link to="/login" className="hover:text-gray-900 transition-colors">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
