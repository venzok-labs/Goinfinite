import Link from "next/link";
import Nav from "../components/Nav";

export default function NotFound() {
  return (
    <>
      <Nav />
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="wrap flex flex-col items-center py-20 text-center">
          <span className="eyebrow">404</span>
          <h1 className="mt-3 text-[clamp(28px,3vw+12px,42px)] text-navy">Page Not Found</h1>
          <p className="mt-3 max-w-[52ch] text-[15.5px] text-steel">
            The page you&apos;re looking for doesn&apos;t exist, or may have moved. Try the homepage or
            our services instead.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn btn-primary">
              Back to Home
            </Link>
            <Link href="/services" className="btn btn-outline">
              View Services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
