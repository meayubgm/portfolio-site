import { ImageResponse } from "next/og";
import { OG_IMAGE_ALT, siteUrl } from "@/lib/site";

export const alt = OG_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** ブループリント格子のセル（px）。globals.css の 24px を OGP の縮尺に合わせて倍にしたもの */
const GRID_CELL = 48;

/** globals.css と同じ色（Tailwind の組み込みパレット由来） */
const SLATE_50 = "#f8fafc";
const SLATE_900 = "#0f172a";
const SLATE_400 = "#94a3b8";
const SKY_700 = "#0369a1";
const INDIGO_600 = "#4f46e5";
const GRID_LINE = "rgba(79, 70, 229, 0.07)";

/** 右側に置く正六面体のワイヤーフレーム（等角投影＝外周の六角形 + 中心からの3本） */
const FIGURE = { cx: 960, cy: 315, r: 170 };

/** 格子線を引く座標（px）を返す */
function gridLines(length: number): number[] {
    const positions: number[] = [];
    for (let x = 0; x < length; x += GRID_CELL) {
        positions.push(x);
    }
    return positions;
}

function hexPoint(index: number) {
    const angle = (Math.PI / 3) * index;
    return {
        x: FIGURE.cx + FIGURE.r * Math.cos(angle),
        y: FIGURE.cy + FIGURE.r * Math.sin(angle),
    };
}

/**
 * OGP 画像（1200×630）。ビルド時に静的生成され、app 直下に置いてあるので全ルートへ継承される。
 *
 * **日本語は描かない。** ImageResponse は同梱の欧文フォントしか持たず、日本語を出すには
 * フォントファイルをリポジトリに抱える必要があるため、文言は英字だけにしている。
 * レイアウトエンジンは Flexbox のサブセットなので、Tailwind ではなく inline style で書く。
 */
export default function OpengraphImage() {
    const vertices = [0, 1, 2, 3, 4, 5].map(hexPoint);
    const outline = vertices.map((p) => `${p.x},${p.y}`).join(" ");
    const spokes = [vertices[0], vertices[2], vertices[4]];

    return new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                position: "relative",
                backgroundColor: SLATE_50,
                fontFamily: "sans-serif",
            }}
        >
            {/* ブループリントの格子。Satori は background-size を解釈しないので線を並べて描く */}
            {gridLines(size.width).map((x) => (
                <div
                    key={`v-${x}`}
                    style={{
                        position: "absolute",
                        left: x,
                        top: 0,
                        width: 1,
                        height: size.height,
                        backgroundColor: GRID_LINE,
                    }}
                />
            ))}
            {gridLines(size.height).map((y) => (
                <div
                    key={`h-${y}`}
                    style={{
                        position: "absolute",
                        left: 0,
                        top: y,
                        width: size.width,
                        height: 1,
                        backgroundColor: GRID_LINE,
                    }}
                />
            ))}

            {/* biome-ignore lint/a11y/noSvgWithoutTitle: 画像として書き出されるため支援技術には露出しない（代替テキストは alt が持つ） */}
            <svg
                width={size.width}
                height={size.height}
                style={{ position: "absolute", left: 0, top: 0 }}
            >
                <polygon
                    points={outline}
                    fill="none"
                    stroke={INDIGO_600}
                    strokeOpacity="0.45"
                    strokeWidth="1.5"
                />
                {spokes.map((p) => (
                    <line
                        key={`${p.x}-${p.y}`}
                        x1={FIGURE.cx}
                        y1={FIGURE.cy}
                        x2={p.x}
                        y2={p.y}
                        stroke={INDIGO_600}
                        strokeOpacity="0.45"
                        strokeWidth="1.5"
                    />
                ))}
                {[...vertices, { x: FIGURE.cx, y: FIGURE.cy }].map((p) => (
                    <circle
                        key={`dot-${p.x}-${p.y}`}
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill={INDIGO_600}
                        fillOpacity="0.6"
                    />
                ))}
            </svg>

            <div
                style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "0 88px",
                    height: "100%",
                }}
            >
                <div style={{ fontSize: 26, color: INDIGO_600, letterSpacing: 2 }}>
                    {"// portfolio"}
                </div>
                <div
                    style={{
                        fontSize: 96,
                        fontWeight: 700,
                        color: SLATE_900,
                        letterSpacing: -2,
                        marginTop: 20,
                    }}
                >
                    Megumi Ayuha
                </div>
                <div style={{ fontSize: 38, color: SKY_700, marginTop: 12 }}>Frontend Engineer</div>
                <div
                    style={{
                        width: 120,
                        height: 1,
                        backgroundColor: SLATE_400,
                        marginTop: 36,
                        marginBottom: 24,
                    }}
                />
                <div style={{ fontSize: 24, color: SLATE_400, letterSpacing: 1 }}>
                    {siteUrl.replace(/^https?:\/\//, "")}
                </div>
            </div>
        </div>,
        size,
    );
}
