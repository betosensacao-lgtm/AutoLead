interface OrganicLinesProps {
  variant?: "dense" | "subtle";
  className?: string;
}

export function OrganicLines({ variant = "subtle", className = "" }: OrganicLinesProps) {
  const opacity = variant === "dense" ? 0.5 : 0.25;

  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    >
      <g fill="none" stroke="#6b7f4f" strokeWidth="1.3" opacity={opacity}>
        <path d="M40,20 C60,60 30,100 60,140 C80,170 70,210 100,250" />
        <path d="M60,140 C90,150 110,130 140,150" />
        <path d="M100,250 C130,230 140,200 170,190" />
        <path d="M380,10 C350,50 370,90 330,120 C300,145 310,190 270,220" />
        <path d="M330,120 C300,110 280,130 250,120" />
        <path d="M270,220 C240,235 220,220 190,235" />
        <circle cx="60" cy="140" r="2.5" fill="#6b7f4f" stroke="none" />
        <circle cx="140" cy="150" r="2.5" fill="#6b7f4f" stroke="none" />
        <circle cx="330" cy="120" r="2.5" fill="#6b7f4f" stroke="none" />
        <circle cx="270" cy="220" r="2.5" fill="#6b7f4f" stroke="none" />
      </g>
    </svg>
  );
}
