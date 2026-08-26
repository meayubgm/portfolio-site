/**
 * ヒーローの線画ワイヤーフレームに使う正多面体の頂点・辺データ。
 *
 * 頂点はすべて単位球上（原点からの距離 1）に正規化してあるので、
 * どの図形でも同じ viewBox・同じカメラ距離でだいたい同じ大きさに収まる。
 *
 * 辺はデータとして持たず「頂点間の最小距離にあるペア」から導出する。
 * 正多面体は全頂点が合同なので、最短の頂点間距離＝辺の長さになる。
 * 手で辺リストを書き下すより取り違えが起きない（正十二面体は 30 本ある）。
 */

export type Vec3 = readonly [number, number, number];
export type Edge = readonly [number, number];
export type Polyhedron = { vertices: readonly Vec3[]; edges: readonly Edge[] };

export type PolyhedronName =
    | "tetrahedron"
    | "hexahedron"
    | "octahedron"
    | "dodecahedron"
    | "icosahedron";

/** 黄金比。正十二面体・正二十面体の座標に使う */
const PHI = (1 + Math.sqrt(5)) / 2;

/** 座標の並びを (x,y,z) -> (y,z,x) -> (z,x,y) と巡回させた3組を返す */
function cyclic(x: number, y: number, z: number): Vec3[] {
    return [
        [x, y, z],
        [y, z, x],
        [z, x, y],
    ];
}

/** 符号の組み合わせ（±a, ±b, ±c）をすべて展開する。0 は重複するので畳む */
function signs(a: number, b: number, c: number): Vec3[] {
    const axis = (n: number) => (n === 0 ? [0] : [n, -n]);
    const out: Vec3[] = [];
    for (const x of axis(a)) {
        for (const y of axis(b)) {
            for (const z of axis(c)) {
                out.push([x, y, z]);
            }
        }
    }
    return out;
}

/** (±a, ±b, ±c) とその巡回置換をすべて集める */
function cyclicSigns(a: number, b: number, c: number): Vec3[] {
    return cyclic(a, b, c).flatMap(([x, y, z]) => signs(x, y, z));
}

/** 全頂点を単位球上へ（正多面体は全頂点が等距離なので一様なスケールで済む） */
function normalize(vertices: readonly Vec3[]): Vec3[] {
    const [x, y, z] = vertices[0];
    const r = Math.hypot(x, y, z);
    return vertices.map(([vx, vy, vz]) => [vx / r, vy / r, vz / r] as Vec3);
}

/** 最小の頂点間距離にあるペアを辺として拾う */
function edgesByMinDistance(vertices: readonly Vec3[]): Edge[] {
    const distance = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

    let min = Number.POSITIVE_INFINITY;
    for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
            min = Math.min(min, distance(vertices[i], vertices[j]));
        }
    }

    // 浮動小数の誤差でわずかに長い辺を取りこぼさないよう、しきい値に余裕を持たせる。
    // 正多面体では「辺」の次に短い頂点間距離が最短の 1.1 倍以上あるため誤検出しない。
    const limit = min * 1.05;
    const edges: Edge[] = [];
    for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
            if (distance(vertices[i], vertices[j]) <= limit) {
                edges.push([i, j]);
            }
        }
    }
    return edges;
}

function build(rawVertices: readonly Vec3[]): Polyhedron {
    const vertices = normalize(rawVertices);
    return { vertices, edges: edgesByMinDistance(vertices) };
}

/** 正四面体（4面・火）— 立方体の頂点のうち座標の積が正になる 4 点 */
const TETRAHEDRON: Vec3[] = [
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
];

/** 正六面体（6面・土） */
const HEXAHEDRON: Vec3[] = signs(1, 1, 1);

/** 正八面体（8面・空気） */
const OCTAHEDRON: Vec3[] = cyclicSigns(1, 0, 0);

/** 正十二面体（12面・宇宙）— 立方体の 8 頂点 + (0, ±1/φ, ±φ) の巡回置換 12 点 */
const DODECAHEDRON: Vec3[] = [...signs(1, 1, 1), ...cyclicSigns(0, 1 / PHI, PHI)];

/** 正二十面体（20面・水）— (0, ±1, ±φ) の巡回置換 12 点 */
const ICOSAHEDRON: Vec3[] = cyclicSigns(0, 1, PHI);

export const polyhedra: Record<PolyhedronName, Polyhedron> = {
    tetrahedron: build(TETRAHEDRON),
    hexahedron: build(HEXAHEDRON),
    octahedron: build(OCTAHEDRON),
    dodecahedron: build(DODECAHEDRON),
    icosahedron: build(ICOSAHEDRON),
};
