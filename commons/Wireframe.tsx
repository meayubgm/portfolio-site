"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { type PolyhedronName, polyhedra, type Vec3 } from "@/lib/polyhedra";

/** 組み上げ演出。duration の終わりで最後の辺が引き終わる */
export type WireframeBuild = { delay: number; duration: number };

type WireframeProps = {
    shape: PolyhedronName;
    /** 自転の速さ（rad/秒）。0 で静止 */
    speed?: number;
    /** 初期の傾き（rad）。ページごとに表情を変えるために振る */
    tilt?: { x: number; y: number };
    /** 渡すと頂点 → 辺の順に組み上がる。省略時は最初から出来上がった状態 */
    build?: WireframeBuild;
    className?: string;
};

/**
 * 透視投影の視点距離（単位球の半径＝1 に対する値）。
 * 小さいほど遠近が強く出る。3 前後が線画として素直に見える範囲。
 */
const CAMERA = 3.2;

/** viewBox の一辺（単位球の半径 1 に対する余白込みの大きさ） */
const VIEW_BOX = 2.7;

/**
 * ヘアラインの既定値（user unit）。
 * マウント後に実サイズから計算し直すので、SSR と初回描画のあいだだけ使う。
 */
const DEFAULT_STROKE = VIEW_BOX / 660;

/**
 * 自転を描き直す間隔（ms）。
 * ゆっくりした回転なので 30fps で十分になめらかに見え、描画回数を半分に減らせる。
 */
const FRAME_MS = 1000 / 30;

/** globals.css の --animate-wf-vertex / --animate-wf-edge と揃える（ms） */
const VERTEX_MS = 260;
const EDGE_MS = 420;

type Projected = { x: number; y: number; depth: number };

/**
 * 投影結果の丸め桁。
 *
 * Math.cos / Math.sin は同じ引数でもエンジンによって最下位ビットが食い違う。
 * 丸めずに SSR すると Node が書いた "0.4939220738078981" と WebKit が計算した
 * 0.4939220738078982 が一致せず hydration mismatch になるため、投影の時点で
 * 丸めて差を落とす。以降の四則演算は IEEE で決定的なので、ここだけで足りる。
 */
const round = (n: number) => Math.round(n * 1e4) / 1e4;

/** Y 軸 → X 軸の順に回して透視投影する。depth は 0（奥）〜1（手前） */
function project(v: Vec3, rx: number, ry: number): Projected {
    const cosY = Math.cos(ry);
    const sinY = Math.sin(ry);
    const x1 = v[0] * cosY + v[2] * sinY;
    const z1 = v[2] * cosY - v[0] * sinY;

    const cosX = Math.cos(rx);
    const sinX = Math.sin(rx);
    const y2 = v[1] * cosX - z1 * sinX;
    const z2 = v[1] * sinX + z1 * cosX;

    const scale = CAMERA / (CAMERA - z2);
    return { x: round(x1 * scale), y: round(y2 * scale), depth: round((z2 + 1) / 2) };
}

/** 手前の頂点ほど大きく・濃く（viewBox 単位。単位球の半径が 1） */
const dotRadius = (depth: number) => 0.009 + 0.005 * depth;
const dotOpacity = (depth: number) => 0.45 + 0.5 * depth;
/** 辺は頂点より薄い。両端の深さの平均で濃さを決める */
const edgeOpacity = (depth: number) => 0.3 + 0.32 * depth;

/**
 * 正多面体のワイヤーフレーム。
 *
 * 組み上げ演出は CSS アニメーション（opacity と stroke-dashoffset）、自転は JS が
 * 属性を直接書き換える、と役割を分けてある。触るプロパティが重ならないので競合せず、
 * JS が動かない環境でも SSR 済みの図形がそのまま出て CSS 演出だけが再生される。
 *
 * 辺には pathLength="1" を置いて長さを正規化しているため、自転で辺の実長が
 * 毎フレーム変わっても stroke-dashoffset の線引きが破綻しない。
 */
export function Wireframe({
    shape,
    speed = 0.16,
    tilt = { x: -0.32, y: 0.55 },
    build,
    className,
}: WireframeProps) {
    const { vertices, edges } = polyhedra[shape];
    const svgRef = useRef<SVGSVGElement>(null);
    const dotsRef = useRef<(SVGCircleElement | null)[]>([]);
    const linesRef = useRef<(SVGLineElement | null)[]>([]);

    /**
     * 描画後の実サイズ（px）。display:none のあいだは 0 になる。
     * 線幅の逆算と、自転を回すかどうかの判定に使う。
     */
    const [renderedWidth, setRenderedWidth] = useState(0);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) {
            return;
        }
        const update = () => setRenderedWidth(svg.getBoundingClientRect().width);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(svg);
        return () => observer.disconnect();
    }, []);

    /** OS の「視差効果を減らす」。閲覧中に切り替えられても止まるよう変更を購読する */
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReduced(query.matches);
        update();
        query.addEventListener("change", update);
        return () => query.removeEventListener("change", update);
    }, []);

    /**
     * 辺の線幅（user unit）。
     *
     * viewBox はどの図形も同じで、実際の描画サイズだけがページごと・画面幅ごとに違う。
     * ヘアラインを保つには vector-effect="non-scaling-stroke" が手軽だが、**それを使うと
     * stroke-dasharray / stroke-dashoffset の単位まで画面ピクセルになり、pathLength="1"
     * による線引きが効かなくなる**（dasharray:1 が「1px の破線」になってしまう）。
     * 線引きを取るため non-scaling-stroke は使わず、描画サイズから線幅を逆算する。
     */
    const strokeWidth = renderedWidth > 0 ? VIEW_BOX / renderedWidth : DEFAULT_STROKE;

    /**
     * 組み上げを始めてよいか。
     *
     * CSS アニメーションは放っておくと「最初のペイント」から数え始めるが、Typewriter は
     * hydration 後に動き出す。そのままだと図形だけ先行して（実測で 0.5 秒ほど）組み上がり、
     * h1 を打ち終わる頃には出来上がって見えてしまう。マウントまで paused にして起点を揃える。
     */
    const [started, setStarted] = useState(false);
    useEffect(() => setStarted(true), []);
    const playState = started ? "running" : "paused";

    // SSR と hydration 直後の座標。クライアント側も同じ tilt から始めるので食い違わない
    const initial = vertices.map((v) => project(v, tilt.x, tilt.y));

    const tiltX = tilt.x;
    const tiltY = tilt.y;

    // 幅が 0 = display:none。見えていないのに投影計算と setAttribute を回し続けないよう、
    // 真偽値で持って依存に入れる（幅そのものを依存にすると、リサイズのたびに回転が
    // 初期角度へ戻る）
    const visible = renderedWidth > 0;

    useEffect(() => {
        if (speed === 0 || reduced || !visible) {
            return;
        }

        let frame = 0;
        const start = performance.now();
        let lastDraw = Number.NEGATIVE_INFINITY;

        const step = (now: number) => {
            frame = requestAnimationFrame(step);
            if (now - lastDraw < FRAME_MS) {
                return;
            }
            lastDraw = now;

            const t = (now - start) / 1000;
            // 2軸の速さをずらすと、同じ姿勢に戻らず単調な回転に見えない
            const points = vertices.map((v) =>
                project(v, tiltX + t * speed * 0.62, tiltY + t * speed),
            );

            for (let i = 0; i < points.length; i++) {
                const dot = dotsRef.current[i];
                if (!dot) {
                    continue;
                }
                const p = points[i];
                dot.setAttribute("cx", String(p.x));
                dot.setAttribute("cy", String(p.y));
                dot.setAttribute("r", String(dotRadius(p.depth)));
                dot.setAttribute("fill-opacity", String(dotOpacity(p.depth)));
            }

            for (let i = 0; i < edges.length; i++) {
                const line = linesRef.current[i];
                if (!line) {
                    continue;
                }
                const a = points[edges[i][0]];
                const b = points[edges[i][1]];
                line.setAttribute("x1", String(a.x));
                line.setAttribute("y1", String(a.y));
                line.setAttribute("x2", String(b.x));
                line.setAttribute("y2", String(b.y));
                line.setAttribute("stroke-opacity", String(edgeOpacity((a.depth + b.depth) / 2)));
            }
        };

        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [vertices, edges, speed, tiltX, tiltY, reduced, visible]);

    // 頂点が先に浮かび、少し遅れて辺が引かれる。最後の辺が duration の終わりで引き終わり、
    // 最後の頂点は辺が引き終わるより前（duration - EDGE_MS 以前）に出そろう
    const buildDuration = build?.duration ?? 0;
    const vertexSpan = Math.max(0, buildDuration - EDGE_MS - VERTEX_MS) * 0.4;
    const edgeStart = vertexSpan * 0.5;
    const edgeSpan = Math.max(0, buildDuration - EDGE_MS - edgeStart);
    const at = (index: number, count: number, from: number, span: number) => {
        if (count < 2) {
            return from;
        }
        return from + (index / (count - 1)) * span;
    };

    const vertexAnim = build && "animate-wf-vertex";
    const edgeAnim = build && "animate-wf-edge";
    // 組み上げを待つ間の姿。CSS の到着が遅れても完成形がちらつかないよう、
    // 「伏せた状態」を presentation attribute 側に置く（globals.css の注記も参照）
    const hiddenDash = build ? 1 : 0;
    const hiddenOpacity = build ? 0 : 1;

    return (
        <svg
            ref={svgRef}
            aria-hidden="true"
            data-geometry={shape}
            viewBox={`${-VIEW_BOX / 2} ${-VIEW_BOX / 2} ${VIEW_BOX} ${VIEW_BOX}`}
            className={cn("overflow-visible", className)}
        >
            <g className="stroke-indigo-600" strokeWidth={strokeWidth}>
                {edges.map(([a, b], i) => (
                    <line
                        key={`edge-${a}-${b}`}
                        ref={(el) => {
                            linesRef.current[i] = el;
                        }}
                        className={cn(edgeAnim)}
                        style={{
                            animationDelay: `${(build?.delay ?? 0) + at(i, edges.length, edgeStart, edgeSpan)}ms`,
                            animationPlayState: playState,
                        }}
                        x1={initial[a].x}
                        y1={initial[a].y}
                        x2={initial[b].x}
                        y2={initial[b].y}
                        pathLength={1}
                        strokeDasharray={1}
                        strokeDashoffset={hiddenDash}
                        strokeOpacity={edgeOpacity((initial[a].depth + initial[b].depth) / 2)}
                    />
                ))}
            </g>

            <g className="fill-indigo-600">
                {vertices.map((v, i) => (
                    <circle
                        key={`vertex-${v.join(",")}`}
                        ref={(el) => {
                            dotsRef.current[i] = el;
                        }}
                        className={cn(vertexAnim)}
                        style={{
                            animationDelay: `${(build?.delay ?? 0) + at(i, vertices.length, 0, vertexSpan)}ms`,
                            animationPlayState: playState,
                        }}
                        cx={initial[i].x}
                        cy={initial[i].y}
                        r={dotRadius(initial[i].depth)}
                        opacity={hiddenOpacity}
                        fillOpacity={dotOpacity(initial[i].depth)}
                    />
                ))}
            </g>
        </svg>
    );
}
