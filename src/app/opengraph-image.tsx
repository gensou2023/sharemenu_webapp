import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MenuCraft AI - AIメニュー画像自動生成";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FAFAF8 0%, #F5F0EB 50%, #EDE6DD 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(232, 113, 58, 0.08)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(212, 168, 83, 0.08)",
            display: "flex",
          }}
        />

        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #E8713A, #D4A853)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            M
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#1A1A1A",
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            MenuCraft AI
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#1A1A1A",
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: 800,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>チャットするだけで</span>
          <span style={{ color: "#E8713A" }}>プロ品質のメニュー</span>
          <span>を自動生成</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 20,
            color: "#6B6560",
            marginTop: 20,
            display: "flex",
          }}
        >
          飲食店オーナーのためのAIデザインツール
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #E8713A, #D4A853, #7B8A64)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
