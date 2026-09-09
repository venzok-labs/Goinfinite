import Reveal from "./Reveal";
import CapabilityWheel from "./CapabilityWheel";

export default function Capabilities() {
  return (
    <section id="capabilities" className="bg-white">
      <div className="wrap">
        <Reveal className="sec-head">
          <div className="eyebrow">Capabilities</div>
          <h2 className="text-[32px]">Engineering Tools. Practical Experience.</h2>
          <p className="max-w-[60ch] text-base">
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
