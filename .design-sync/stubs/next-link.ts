// design-sync 用の next/link スタブ。
// デザインペイン（Next ランタイム非搭載）では next/link が router コンテキストを
// 要求して throw するため、素の <a> を返すコンポーネントへ差し替える。
import * as React from "react";

type LinkProps = {
  href?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
};

export default function Link({ href, children, ...rest }: LinkProps) {
  return React.createElement("a", { href, ...rest }, children as React.ReactNode);
}
