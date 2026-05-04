import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Button from "./ui/Button";

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-gray-200 bg-white px-6">
      <Link to="/" className="text-lg font-bold text-brand-700 tracking-tight">
        DipWise
      </Link>
      <span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700 uppercase">
        Beta
      </span>
      <div className="ml-auto flex items-center gap-3">
        {token && user ? (
          <>
            <span className="hidden text-sm text-slate-600 sm:inline">
              {user.email}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => logout()}
            >
              Log out
            </Button>
          </>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={() => void navigate("/login")}
          >
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
}
