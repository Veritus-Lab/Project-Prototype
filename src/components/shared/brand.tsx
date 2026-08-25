import Image from "next/image";
import Link from "next/link";

interface BrandProps {
  compact?: boolean;
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <Link className="brand" href="/" aria-label="FLERNK — página inicial">
      <Image
        className="brand-mark"
        src="/flernk-logo.jpg"
        alt=""
        aria-hidden="true"
        width={44}
        height={44}
        priority={!compact}
      />
      <span>FLERNK</span>
    </Link>
  );
}
