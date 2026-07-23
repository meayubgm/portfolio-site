// design-sync 用の next/image スタブ。
// 本物の next/image は process.env.NEXT_* を参照するためデザインペイン
// （Next ランタイム非搭載・process 未定義）でバンドル全体が throw する。
// 素の <img> を返すコンポーネントへ差し替える。
import * as React from "react";

type StaticImport = { src: string; width?: number; height?: number };

type ImageProps = {
    src?: string | StaticImport;
    alt?: string;
    width?: number | string;
    height?: number | string;
    [key: string]: unknown;
};

export default function Image({ src, alt = "", width, height, ...rest }: ImageProps) {
    const resolved = typeof src === "object" && src !== null ? src.src : src;
    return React.createElement("img", { src: resolved, alt, width, height, ...rest });
}
