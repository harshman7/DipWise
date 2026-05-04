import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-gray-200 bg-white px-6">
      <Link to="/" className="text-lg font-bold text-brand-700 tracking-tight">
        DipWise
      </Link>
      <span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700 uppercase">
        Beta
      </span>
    </header>
  );
}
