// design-sync 用の next/navigation スタブ。
// useRouter / usePathname 等はデザインペインでは Next の router コンテキストが無く
// throw するため、副作用なしのダミー実装へ差し替える。
export function useRouter() {
    const noop = () => {};
    return {
        push: noop,
        replace: noop,
        prefetch: noop,
        back: noop,
        forward: noop,
        refresh: noop,
    };
}

export function usePathname() {
    return "/";
}

export function useSearchParams() {
    return new URLSearchParams();
}

export function useParams<T = Record<string, string>>() {
    return {} as T;
}

export function useSelectedLayoutSegment() {
    return null;
}

export function useSelectedLayoutSegments() {
    return [] as string[];
}

export function redirect() {}
export function notFound() {}
