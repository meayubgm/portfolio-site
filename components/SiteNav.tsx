"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GlassCard } from "@/commons/GlassCard";
import { textStyles } from "@/commons/Text";
import { cn } from "@/lib/cn";
import icon from "../app/icon.svg";

const links = [
    { href: "/", label: "home" },
    { href: "/works", label: "works" },
    { href: "/skills", label: "skills" },
    { href: "/about", label: "about" },
    { href: "/contact", label: "contact" },
];

/** これ未満のスクロール量は無視する（トラックパッドの微振動でちらつかせない） */
const SCROLL_THRESHOLD = 8;
/** ページ最上部付近ではナビを隠さない */
const HIDE_AFTER = 80;

/** ロゴ。nav 本体と、狭い画面のメニューパネルの2箇所で使う */
function NavLogo({ className }: { className?: string }) {
    return (
        // perspective は親に置く（子だけで回すと奥行きが出ず平面的に潰れる）
        <Link
            href="/"
            className={cn("group pointer-events-auto shrink-0 perspective-midrange", className)}
        >
            <Image
                src={icon}
                alt="icon"
                width="40"
                height="40"
                className="transform-3d transition-transform duration-500 ease-out group-hover:rotate-y-360 motion-reduce:transition-none"
            />
        </Link>
    );
}

/** 3本線 ⇄ ×。sm 未満でだけ出す */
function MenuButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
    // 幅はロゴ（40px = w-10）に揃える。線の中心間は 8px（h-px + gap-1.75）なので、
    // 上下を 8px（translate-y-2）寄せると中央で交差して × になる
    const bar =
        "block h-px w-10 bg-indigo-600 transition-[translate,rotate,opacity] duration-300 motion-reduce:transition-none";
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "メニューを閉じる" : "メニューを開く"}
            className="pointer-events-auto flex h-11 w-10 cursor-pointer flex-col items-center justify-center gap-1.75 sm:hidden"
        >
            <span className={cn(bar, open && "translate-y-2 rotate-45")} />
            <span className={cn(bar, open && "opacity-0")} />
            <span className={cn(bar, open && "-translate-y-2 -rotate-45")} />
        </button>
    );
}

export function SiteNav() {
    const pathname = usePathname();
    const [hidden, setHidden] = useState(false);
    const [open, setOpen] = useState(false);

    // 下スクロールで引っ込め、上スクロールで戻す
    useEffect(() => {
        let lastY = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            if (Math.abs(y - lastY) < SCROLL_THRESHOLD) {
                return;
            }
            setHidden(y > lastY && y > HIDE_AFTER);
            lastY = y;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // 遷移したらメニューを閉じる（畳むアニメーションは遷移後にそのまま再生される）。
    // ただし現在地のリンクを踏んだときは pathname が変わらず effect が走らないので、
    // パネル側のリンクは onClick でも閉じる（両方要る。ブラウザバックはこちらが拾う）
    // biome-ignore lint/correctness/useExhaustiveDependencies: pathname の変化そのものが契機
    useEffect(() => setOpen(false), [pathname]);

    // "/" は完全一致、それ以外は配下（例: /works/brew）も active 扱い
    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    const linkTone = (href: string) => (isActive(href) ? "text-indigo-600" : "text-slate-600");

    return (
        <>
            <nav
                // 隠れている間もリンクはタブ移動の対象なので、フォーカスが入ったら出し直す
                onFocus={() => setHidden(false)}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-between px-8 py-4",
                    // sm 未満はロゴを少し下げて左端に寄せる。パネル側のロゴもここに重ねる
                    "max-sm:pt-6 max-sm:px-5.5",
                    // 面（磨りガラス + 影）は sm 以上だけ。狭い画面は透明にしてロゴとボタンだけ浮かせる。
                    // 透明な帯がメニューパネル上端のリンクを遮らないよう、当たり判定も外す
                    "sm:backdrop-blur-xs sm:shadow-xs max-sm:pointer-events-none",
                    "transition-transform duration-300 ease-out motion-reduce:transition-none",
                    // スクロール連動の出し入れも sm 以上だけ。sm 未満は常に画面上部に留める
                    hidden && "sm:-translate-y-full",
                )}
            >
                {/* パネルにも同じロゴが出るので、開いている間はこちらを伏せて二重に見せない */}
                <NavLogo className={cn(open && "max-sm:invisible")} />
                <div className={cn("hidden gap-9 sm:flex", textStyles.monoMd)}>
                    {links.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className={cn(
                                "group relative transition-colors hover:text-indigo-600",
                                linkTone(l.href),
                            )}
                        >
                            {/* GlassCard 右上の「+」と同じ導線サイン。絶対配置でラベルを動かさない。
                                aria-hidden が無いとアクセシブルネームが「+ home」になる */}
                            <span
                                aria-hidden
                                className="pointer-events-none absolute -left-3.5 text-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
                            >
                                +
                            </span>
                            {l.label}
                        </Link>
                    ))}
                </div>
                <MenuButton open={open} onToggle={() => setOpen((v) => !v)} />
            </nav>

            {/*
             * 狭い画面のメニューパネル。上端を起点に下へ伸び、閉じるときは上へ畳まれる。
             *
             * 伸縮は grid-template-rows を 0fr → 1fr で動かす（max-height の決め打ちが要らず、
             * scale-y のように中身が歪まない）。畳むアニメーションを見せるためパネルは常時
             * マウントしたままにし、visibility で出し入れする。visibility は離散プロパティなので
             * 開くときは始点で、閉じるときは終点で切り替わり、accessibility tree からも外れる。
             *
             * z は nav（z-50）より下に置く。nav は position:fixed + z-index で stacking context を
             * 作るので、閉じるボタンに z を足してもこの外側のパネルより手前には出せない。
             */}
            <div
                id="site-menu"
                className={cn(
                    // 位置はパネル内のロゴが nav のロゴとぴたりと重なるように決めてある。
                    // 左: 11 + 1（枠線）+ 10（GlassCard の p-2.5）= 22 = nav の max-sm:px-5.5
                    // 上: 15 + 1（枠線）+ 10（同上）             = 26 = nav の max-sm:pt-6 + items-center の 2px
                    // GlassCard の padding を変えたらこの2値も直す
                    "fixed inset-x-2.75 top-3.75 z-40 grid sm:hidden",
                    "transition-[grid-template-rows,visibility] duration-300 ease-out motion-reduce:transition-none",
                    open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
                )}
            >
                {/* 0fr のときに中身をはみ出させないためのクリップ層 */}
                <div className="overflow-hidden">
                    <GlassCard
                        hoverEffects={false}
                        className="flex justify-between border-indigo-600 p-2.5 sm:p-7"
                    >
                        <NavLogo />
                        <div
                            className={cn(
                                // 列幅は中身なり。flex-1 を持たせず、カード側の justify-between で
                                // ロゴとこのリンク群を左右へ振り分ける
                                "grid grid-cols-[max-content_max-content] gap-y-3 gap-x-12",
                                // 右上に重なる × を避けるための逃げ。× の線は w-10（40px）で
                                // ボタン枠より外へはみ出し、右端はカードの内側右端に接するので、
                                // 40px を下回ると1行目のリンクが × と重なる
                                "pr-24",
                                textStyles.monoMd,
                            )}
                        >
                            {links.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setOpen(false)}
                                    className={cn("relative", linkTone(l.href))}
                                >
                                    {/* 現在地の印。nav の導線サインと同じ「+」を先頭に置く。
                                        絶対配置でラベルを動かさず、aria-hidden で名前にも混ぜない。
                                        左オフセットはラベル左側の空き（右列は gap-x、左列はロゴとの
                                        間隔）に収める。はみ出すと隣のラベルに重なって
                                        「home+ works」のように読めてしまう */}
                                    {isActive(l.href) && (
                                        <span
                                            aria-hidden
                                            className="pointer-events-none absolute -left-2.5 text-indigo-600"
                                        >
                                            +
                                        </span>
                                    )}
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </>
    );
}
