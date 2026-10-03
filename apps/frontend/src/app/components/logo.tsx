import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link
      to="/"
      aria-label="Sober Home"
      className="text-[#05051d] text-lg font-bold tracking-tight inline-flex items-center gap-0.5 no-underline"
    >
      Sober
      <span className="text-[#7472d5] font-mono text-xs tracking-tighter">
        //
      </span>
    </Link>
  );
}
