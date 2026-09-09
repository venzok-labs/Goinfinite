import Reveal from "./Reveal";
import CapabilityWheel from "./CapabilityWheel";

export default function Capabilities() {
  return (
    <section id="capabilities" className="bg-white">
      <div className="wrap">
        <Reveal className="sec-head">
          <div className="eyebrow">Capabilities</div>
          <h2 className="text-[32px]">Tap a Segment to See the Engineering Tools &amp; Practical Experience</h2>
          <p className="max-w-[60ch] text-base">
            Technology backed by real engineering experience — not just a wall of logos.
          </p>
        </Reveal>

        <CapabilityWheel />
      </div>
    </section>
  );
}
