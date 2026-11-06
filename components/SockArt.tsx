import { useId } from "react";

// A drawn sock used wherever a product has no uploaded photo yet.
// Each design passes its own palette and drawing style, and the product id
// picks a stable pattern so neighbouring cards don't all look the same.

type Props = {
  seed?: number;
  colors: string[]; // sock body colors; pattern colors are picked from these
  bg?: string;
  line?: string; // outline color (for "line" style)
  variant?: "flat" | "line" | "bold";
  className?: string;
  label?: string;
};

const SOCK =
  "M84 22 H132 V118 Q132 150 112 162 L62 182 Q34 192 26 170 Q20 150 44 140 L84 122 Z";

export default function SockArt({ seed = 0, colors, bg = "transparent", line = "#111", variant = "flat", className, label }: Props) {
  const id = useId().replace(/:/g, "");
  const n = colors.length;
  const c = (i: number) => colors[(seed + i) % n];
  const pattern = seed % 4; // 0 stripes, 1 dots, 2 zigzag, 3 color-block
  const tilt = ((seed % 3) - 1) * 6;
  const sw = variant === "bold" ? 6 : variant === "line" ? 2.5 : 0;

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={label || "جوراب"} preserveAspectRatio="xMidYMid meet">
      <rect width="200" height="200" fill={bg} />
      <defs>
        <clipPath id={`s${id}`}>
          <path d={SOCK} />
        </clipPath>
      </defs>
      <g transform={`rotate(${tilt} 100 100) translate(16 -2)`}>
        {variant === "bold" && <path d={SOCK} fill={line} transform="translate(7 7)" />}
        <g clipPath={`url(#s${id})`}>
          <rect width="200" height="200" fill={variant === "line" ? bg : c(0)} />
          {pattern === 0 &&
            [40, 64, 88].map((y) => <rect key={y} x="0" y={y} width="200" height="10" fill={c(1)} opacity={variant === "line" ? 0.9 : 1} />)}
          {pattern === 1 &&
            Array.from({ length: 30 }, (_, i) => (
              <circle key={i} cx={30 + (i % 6) * 22 + (Math.floor(i / 6) % 2) * 11} cy={44 + Math.floor(i / 6) * 28} r="5" fill={c(1)} />
            ))}
          {pattern === 2 && (
            <path
              d="M0 60 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l12 12 M0 92 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l12 12"
              fill="none"
              stroke={c(1)}
              strokeWidth="7"
            />
          )}
          {pattern === 3 && <rect x="0" y="70" width="200" height="140" fill={c(1)} />}
          {/* cuff */}
          <rect x="0" y="0" width="200" height="38" fill={c(2)} />
          <rect x="0" y="30" width="200" height="3" fill={c(0)} opacity="0.35" />
          {/* heel and toe */}
          <circle cx="132" cy="160" r="26" fill={c(2)} />
          <circle cx="28" cy="168" r="24" fill={c(2)} />
        </g>
        {sw > 0 && <path d={SOCK} fill="none" stroke={line} strokeWidth={sw} strokeLinejoin="round" />}
      </g>
    </svg>
  );
}
