import { EyebrowLabel } from "portfolio-site";

export function Default() {
  return <EyebrowLabel>選ばれる理由</EyebrowLabel>;
}

export function English() {
  return <EyebrowLabel>What I do</EyebrowLabel>;
}

export function Stacked() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <EyebrowLabel>ヒアリング</EyebrowLabel>
      <EyebrowLabel>デザイン</EyebrowLabel>
      <EyebrowLabel>実装</EyebrowLabel>
    </div>
  );
}
