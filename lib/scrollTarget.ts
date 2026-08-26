/**
 * ページ遷移をまたいで「着地後にスクロールしたい要素」を一件だけ受け渡す。
 *
 * URL のハッシュは使えない。App Router がルートごとに正規 URL（ハッシュ込み）を
 * 保持しており、一度ハッシュ付きで遷移すると、その後 SiteNav などから普通に
 * 同じルートへ遷移してもマウント時点の location.hash にそれが復活するため、
 * 意図しないスクロールが毎回起きる。
 *
 * sessionStorage はサイトデータをブロックしている環境ではアクセス自体が
 * SecurityError を投げる。演出のためだけの機能なので、失敗しても素の遷移に倒す。
 */
const KEY = "scroll-target";

/** 遷移前に、着地先でスクロールさせたい要素の id を預ける */
export function requestScrollTo(id: string) {
    try {
        window.sessionStorage.setItem(KEY, id);
    } catch {
        // 預けられなければスクロールしないだけ。遷移は妨げない
    }
}

/** 着地先で取り出す。一度きりの受け渡しなので取り出したら消す */
export function takeScrollTarget(): string | null {
    try {
        const id = window.sessionStorage.getItem(KEY);
        if (id) {
            window.sessionStorage.removeItem(KEY);
        }
        return id;
    } catch {
        return null;
    }
}
