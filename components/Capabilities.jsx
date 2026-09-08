import Reveal from "./Reveal";
import CapabilityWheel from "./CapabilityWheel";
import styles from "./Capabilities.module.css";

export default function Capabilities() {
  return (
    <section id="capabilities" className="tint">
      <div className="wrap">
        <Reveal className="sec-head">
          <div className="eyebrow">Capabilities</div>
          <h2 className={styles.h2}>Engineering Tools. Practical Experience.</h2>
          <p className={styles.lede}>
            Technology backed by real engineering experience — not just a wall of logos. Explore
            each segment of the wheel to see the tools, capabilities and applications we work
            with.
          </p>
        </Reveal>

        <CapabilityWheel />
      </div>
    </section>
  );
}
