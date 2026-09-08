import styles from "./Logo.module.css";

// The actual provided brand mark (public/logo-mark.png), lightened/desaturated
// slightly with a soft white halo baked in — its native blue tones measured
// almost identical to the #076bdd banner color, so without that adjustment
// the icon would nearly disappear on a solid-blue background.
export default function Logo({ size = 34, onDark = false, className = "" }) {
  const height = size;
  const width = Math.round(size * (760 / 384));

  return (
    <div className={`${styles.logo} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.png"
        alt="Infinite Solutions"
        width={width}
        height={height}
        className={styles.mark}
      />
      <span className={`${styles.word} ${onDark ? styles.onDark : ""}`}>
        <b>Infinite</b> <span>Solutions</span>
      </span>
    </div>
  );
}
