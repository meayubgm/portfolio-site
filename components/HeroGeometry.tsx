import { Wireframe, type WireframeBuild } from "@/commons/Wireframe";
import { cn } from "@/lib/cn";
import { heroGeometryBuild } from "@/lib/home";
import type { PolyhedronName } from "@/lib/polyhedra";

/** 図形を置くページ。/contact は対象外（意図的に図形を持たない） */
export type HeroGeometryPage = "home" | "works" | "brew" | "skills" | "about";

/** サブページ共通の出現尺。home のような長い組み上げは行わない */
const SUB_BUILD: WireframeBuild = { delay: 120, duration: 720 };

type Placement = {
    shape: PolyhedronName;
    /** ビューポートを基準にした位置と大きさ（枠は fixed inset-0） */
    figure: string;
    /** 狭い画面での位置と大きさの上書き（`max-sm:` / `max-md:` 付きのクラスで渡す） */
    mobileFigure?: string;
    tilt: { x: number; y: number };
    speed: number;
    build: WireframeBuild;
};

/**
 * ページごとの図形・配置。図形は元素の対応（水/火/空気/土/宇宙）で割り当ててある。
 * 枠はビューポートに固定するので、位置はスクロール位置ではなく画面を基準に読む。
 * 画面端で一部が切れるよう、いずれも右へ寄せてはみ出させている。
 */
const PLACEMENTS: Record<HeroGeometryPage, Placement> = {
    // 正二十面体（水）。ヒーローの主役なので大きく置く
    home: {
        shape: "icosahedron",
        figure: "top-1/2 right-[-16vw] w-[62vw] max-w-[990px] -translate-y-1/2 xl:right-[-12vw] xl:w-[66vw]",
        // sm 未満だけ 1.5 倍。狭い画面では 62vw だと図形が小さくまとまりすぎるため
        mobileFigure: "max-sm:right-[-24vw] max-sm:w-[93vw]",
        tilt: { x: -0.3, y: 0.5 },
        speed: 0.15,
        build: heroGeometryBuild,
    },
    // 正八面体（空気）
    works: {
        shape: "octahedron",
        figure: "top-[7rem] right-[-6vw] w-[28vw] max-w-[380px]",
        mobileFigure: "max-md:top-[4.5rem] max-md:right-[-14vw] max-md:w-[54vw]",
        tilt: { x: -0.42, y: 0.2 },
        speed: 0.19,
        build: SUB_BUILD,
    },
    // 正六面体（土）
    brew: {
        shape: "hexahedron",
        figure: "top-[7rem] right-[-9vw] w-[27vw] max-w-[370px]",
        mobileFigure: "max-md:top-[4.5rem] max-md:right-[-16vw] max-md:w-[54vw]",
        tilt: { x: -0.5, y: 0.62 },
        speed: 0.17,
        build: SUB_BUILD,
    },
    // 正四面体（火）
    skills: {
        shape: "tetrahedron",
        figure: "top-[7rem] right-[-3vw] w-[30vw] max-w-[400px]",
        mobileFigure: "max-md:top-[4.5rem] max-md:right-[-8vw] max-md:w-[56vw]",
        tilt: { x: 0.6, y: 0.42 },
        speed: 0.21,
        build: SUB_BUILD,
    },
    // 正十二面体（宇宙）
    about: {
        shape: "dodecahedron",
        figure: "top-[6rem] right-[-6vw] w-[30vw] max-w-[420px]",
        mobileFigure: "max-md:top-[4rem] max-md:right-[-14vw] max-md:w-[56vw]",
        tilt: { x: -0.28, y: 0.35 },
        speed: 0.14,
        build: SUB_BUILD,
    },
};

/**
 * ページの背景に敷く正多面体のワイヤーフレーム。
 *
 * ビューポートに固定するのでスクロールしても位置が変わらず、カードやテキストが
 * その上を流れていく（フロスト面のカードには裏から透けて見える）。
 *
 * 親（app/layout.tsx の max-w-site コンテナ）が relative z-2 で stacking context を
 * 作っているので、-z-1 を持つこの枠はコンテナ内の本文・カードより後ろ、body の
 * ブループリント格子とアンビエントグローより手前に描かれる。
 */
export function HeroGeometry({ page }: { page: HeroGeometryPage }) {
    const { shape, figure, mobileFigure, tilt, speed, build } = PLACEMENTS[page];
    return (
        <div
            aria-hidden
            // fixed inset-0 でビューポートに貼り付ける。図形はスクロールしても動かず、
            // 上を流れていくカードの裏に透けて見える。overflow-hidden が画面端で図形を切る
            className={cn(
                "pointer-events-none fixed inset-0 -z-1 overflow-hidden",
                // 狭い画面では本文と重なるため、消さずに薄くして可読性を保つ
                "opacity-45 md:opacity-100",
            )}
        >
            <Wireframe
                shape={shape}
                tilt={tilt}
                speed={speed}
                build={build}
                className={cn("absolute aspect-square", figure, mobileFigure)}
            />
        </div>
    );
}
