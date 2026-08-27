import Link from "next/link";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="FLERNK — página inicial">
      <span className="brand-mark" aria-hidden="true">
        F
      </span>
      <span>FLERNK</span>
    </Link>
  );
}
