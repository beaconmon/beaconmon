export default function Logo({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      role="img"
      aria-label="Beaconmon"
      width={size}
      height={size}
      className={className}
    >
      <rect fill="#0f172a" width="32" height="32" rx="7" />
      <path d="M4 22a12 12 0 0 0 24 0" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" opacity=".28" />
      <path d="M8 22a8 8 0 0 0 16 0" fill="none" stroke="#06b6d4" strokeWidth="2.2" strokeLinecap="round" opacity=".62" />
      <path d="M12 22a4 4 0 0 0 8 0" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 24.5V28" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" opacity=".45" />
      <circle cx="16" cy="22" r="2.5" fill="#06b6d4" />
    </svg>
  );
}
