// The Infinite Solutions gear/infinity mark, recreated as a lightweight inline SVG
// so it can be reused at any size (nav, footer, About panel) without an image asset.
export default function BrandMark({ variant = "color", size = 34, className = "" }) {
  const strokeUrl = variant === "white" ? "#ffffff" : "url(#markGrad)";
  const gearOpacity = variant === "white" ? 0.4 : 0.55;

  return (
    <svg
      viewBox="0 0 140 74"
      width={size}
      height={(size * 74) / 140}
      className={className}
      aria-label="Infinite Solutions"
    >
      {variant === "color" && (
        <defs>
          <linearGradient id="markGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0b2a4a" />
            <stop offset="0.55" stopColor="#1d6fbf" />
            <stop offset="1" stopColor="#8fc9ff" />
          </linearGradient>
        </defs>
      )}
      <circle cx="35" cy="37" r="29" fill="none" stroke={strokeUrl} strokeWidth="5" strokeDasharray="5.2 4.6" opacity={gearOpacity} />
      <circle cx="105" cy="37" r="29" fill="none" stroke={strokeUrl} strokeWidth="5" strokeDasharray="5.2 4.6" opacity={gearOpacity} />
      <path
        d="M18,37 C18,17 53,17 70,37 C87,57 122,57 122,37 C122,17 87,17 70,37 C53,57 18,57 18,37 Z"
        fill="none"
        stroke={strokeUrl}
        strokeWidth="11"
        strokeLinecap="round"
      />
      {variant === "color" && (
        <path
          d="M18,37 C18,17 53,17 70,37 C87,57 122,57 122,37 C122,17 87,17 70,37 C53,57 18,57 18,37 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          opacity=".75"
        />
      )}
    </svg>
  );
}
