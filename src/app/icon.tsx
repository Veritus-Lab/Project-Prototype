import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ alignItems: "center", background: "#101315", color: "#f1e900", display: "flex", fontSize: 88, fontWeight: 800, height: "100%", justifyContent: "center", width: "100%" }}>FLERNK</div>,
    size,
  );
}
