import type { ReactNode } from "react";

/** mono / indigo のセクション見出し（例: "// 開発背景・課題設定"） */
export function MonoHeading({ children }: { children: ReactNode }) {
    return <p className="m-0 mb-3 font-mono text-[15px] text-indigo-600">{children}</p>;
}
