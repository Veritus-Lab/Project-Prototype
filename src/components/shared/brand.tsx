import Image from "next/image";
import Link from "next/link";

type BrandProps = {
  compact?: boolean;
};

export function Brand({ compact = false }: BrandProps) {
  const size = compact ? 36 : 44;

  return (
    <Link
      aria-label="FLERNK - início"
      className="inline-flex items-center gap-3"
      href="/"
    >
      <Image
        alt="Símbolo da FLERNK"
        className="rounded-lg object-cover"
        height={size}
        priority={!compact}
        src="/flernk-logo.jpg"
        style={{ height: size, width: size }}
        width={size}
      />
      <span className="text-xl font-black text-white">FLERNK</span>
    </Link>
  );
}
