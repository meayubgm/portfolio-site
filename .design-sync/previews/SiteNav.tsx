import { SiteNav } from "portfolio-site";

// SiteNav は position: fixed の全幅ナビ。カード内で高さを確保するため
// slate-50 の背景ステージの上に置く（cfg.overrides で cardMode: single）。
export function Default() {
  return (
    <div style={{ position: "relative", minHeight: 96, background: "#f8fafc" }}>
      <SiteNav />
    </div>
  );
}
