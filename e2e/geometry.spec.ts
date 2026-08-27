import { expect, test } from "@playwright/test";

/**
 * ヒーローの正多面体ワイヤーフレーム（components/HeroGeometry.tsx）:
 * - ページごとに割り当てた図形が出ること（/contact だけ持たない）
 * - JS 無効でも SSR された図形がそのまま出ること
 * - prefers-reduced-motion では自転せず、組み上げも待たずに表示されること
 * - 画面いっぱいの枠を敷いても横スクロールが出ないこと
 * - 狭い画面（md 未満）では消さずに薄くして出すこと
 */

/** ページ → 図形（頂点数 / 辺数）。図形の対応は元素（水・火・空気・土・宇宙）に由来する */
const SHAPES = [
    { path: "/", shape: "icosahedron", edges: 30 },
    { path: "/works", shape: "octahedron", edges: 12 },
    { path: "/works/brew", shape: "hexahedron", edges: 12 },
    { path: "/skills", shape: "tetrahedron", edges: 6 },
    { path: "/about", shape: "dodecahedron", edges: 30 },
] as const;

for (const { path, shape, edges } of SHAPES) {
    test(`${path} に ${shape} が描かれる`, async ({ page }) => {
        await page.goto(path);
        const svg = page.locator("[data-geometry]");
        await expect(svg).toHaveCount(1);
        await expect(svg).toHaveAttribute("data-geometry", shape);
        await expect(page.locator("[data-geometry] line")).toHaveCount(edges);
    });
}

test("/contact には図形を置かない", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("[data-geometry]")).toHaveCount(0);
});

test("図形の枠を敷いても横スクロールが出ない", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => {
        const d = document.documentElement;
        return d.scrollWidth - d.clientWidth;
    });
    expect(overflow).toBe(0);
});

/**
 * 線引き（stroke-dasharray + pathLength）が生きていることを確かめる。
 *
 * vector-effect="non-scaling-stroke" を付けると dash の単位が画面ピクセルになり、
 * pathLength="1" の正規化が無視されて「1px の破線」に化ける（＝線引きが効かず、
 * 図形が最初から出来上がって見える）。ヘアラインは線幅を実サイズから逆算して保つ。
 */
test("辺の線引きが効く設定になっている", async ({ page }) => {
    await page.goto("/");
    const line = page.locator("[data-geometry] line").first();
    await expect(line).toHaveAttribute("pathLength", "1");
    await expect(line).toHaveAttribute("stroke-dasharray", "1");
    expect(await line.getAttribute("vector-effect")).toBeNull();
});

test("辺は図形の大きさに関わらず 1px のヘアラインで描かれる", async ({ page }) => {
    const renderedStrokePx = () =>
        page.locator("[data-geometry]").evaluate((svg: SVGSVGElement) => {
            const group = svg.querySelector("line")?.parentElement;
            const width = Number(group?.getAttribute("stroke-width"));
            return (width * svg.getBoundingClientRect().width) / svg.viewBox.baseVal.width;
        });

    for (const path of ["/", "/skills"]) {
        await page.goto(path);
        // 実サイズからの逆算はマウント後（ResizeObserver）。それまでは SSR 用の既定値が入っている
        await expect.poll(renderedStrokePx).toBeLessThan(1.2);
        expect(await renderedStrokePx()).toBeGreaterThan(0.8);
    }
});

test("自転して頂点の座標が変わり続ける", async ({ page }) => {
    await page.goto("/");
    const line = page.locator("[data-geometry] line").first();
    const before = await line.getAttribute("x1");
    await expect(async () => {
        expect(await line.getAttribute("x1")).not.toBe(before);
    }).toPass({ timeout: 2_000 });
});

test.describe("狭い画面（md 未満）", () => {
    test.use({ viewport: { width: 375, height: 720 } });

    test("図形は薄くして出し、自転も続ける", async ({ page }) => {
        await page.goto("/");
        // 本文と重なるため消さずに薄くする（opacity-45 md:opacity-100）
        const frame = page.locator("[data-geometry]").locator("..");
        await expect(frame).toHaveCSS("opacity", "0.45");

        const line = page.locator("[data-geometry] line").first();
        const before = await line.getAttribute("x1");
        await expect(async () => {
            expect(await line.getAttribute("x1")).not.toBe(before);
        }).toPass({ timeout: 2_000 });
    });
});

test.describe("JS 無効", () => {
    test.use({ javaScriptEnabled: false });

    test("SSR された図形がそのまま出る", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("[data-geometry]")).toHaveAttribute(
            "data-geometry",
            "icosahedron",
        );
        await expect(page.locator("[data-geometry] line")).toHaveCount(30);

        // 組み上げ待ちの伏せた姿（opacity="0" / stroke-dashoffset="1"）を素に戻すのは
        // globals.css の @media (scripting: none) だけなので、要素数ではなく見え方を見る
        await expect(page.locator("[data-geometry] line").first()).toHaveCSS(
            "stroke-dashoffset",
            "0px",
        );
        await expect(page.locator("[data-geometry] circle").first()).toHaveCSS("opacity", "1");
    });
});

test.describe("prefers-reduced-motion: reduce", () => {
    test("自転せず、組み上げを待たずに表示される", async ({ page }) => {
        // test.use({ reducedMotion }) はこの構成だと反映されないため、ページ側で明示的に切り替える
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto("/");
        const line = page.locator("[data-geometry] line").first();
        // 組み上げアニメーションが無効化され、線は最初から引かれ切っている
        await expect(line).toHaveCSS("animation-name", "none");
        await expect(line).toHaveCSS("stroke-dashoffset", "0px");

        const before = await line.getAttribute("x1");
        await page.waitForTimeout(500);
        expect(await line.getAttribute("x1")).toBe(before);
    });
});
