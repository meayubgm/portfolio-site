import { Button } from "portfolio-site";

export function Primary() {
  return <Button>プロジェクトを見る</Button>;
}

export function Ghost() {
  return <Button variant="ghost">GitHub</Button>;
}

export function AsLink() {
  return (
    <Button variant="primary" href="/works">
      実績一覧へ
    </Button>
  );
}

export function Row() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button>連絡する</Button>
      <Button variant="ghost">Email</Button>
    </div>
  );
}
