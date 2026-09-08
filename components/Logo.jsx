// The actual provided brand mark (public/logo-mark.png), lightened/desaturated
// slightly with a soft white halo baked in — its native blue tones measured
// almost identical to the #076bdd banner color, so without that adjustment
// the icon would nearly disappear on a solid-blue background.
export default function Logo({ size = 34, onDark = false, className = "" }) {
  const height = size;
  const width = Math.round(size * (760 / 384));

  return (
    <div
      className={`flex items-center gap-2.5 whitespace-nowrap font-display text-[19px] font-bold ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.png"
        alt="Infinite Solutions"
        width={width}
        height={height}
        className="block h-auto"
      />
      <span>
        <b className={onDark ? "font-bold text-white" : "font-bold text-blue"}>Infinite</b>{" "}
        <span className={onDark ? "font-semibold text-white/78" : "font-semibold text-steel"}>
          Solutions
        </span>
      </span>
    </div>
  );
}
