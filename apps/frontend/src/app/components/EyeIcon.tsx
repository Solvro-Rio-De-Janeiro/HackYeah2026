export function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4">
      <path d="M2.5 12s3.45-5.5 9.5-5.5S21.5 12 21.5 12s-3.45 5.5-9.5 5.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.25" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4">
      <path d="m3 3 18 18" />
      <path d="M10.6 6.7A9.9 9.9 0 0 1 12 6.5c6.05 0 9.5 5.5 9.5 5.5a16.6 16.6 0 0 1-3.16 3.55M6.1 6.08C3.86 7.56 2.5 9.7 2.5 12c0 0 3.45 5.5 9.5 5.5 1.45 0 2.73-.32 3.83-.83" />
      <path d="M9.9 9.9a3 3 0 0 0 4.22 4.22" />
    </svg>
  );
}

export default EyeIcon;
