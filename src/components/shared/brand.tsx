import Link from "next/link";
import { FLERNK_LOGO_SRC } from "./brand-logo";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="FLERNK — página inicial">
      {/* The logo is an inline data URI so it is available without a network request. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="brand-mark"
        src={FLERNK_LOGO_SRC}
        alt=""
        aria-hidden="true"
        width={44}
        height={44}
      />
      <span>FLERNK</span>
    </Link>
  );
}
