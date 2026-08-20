import { NextResponse } from "next/server";
import { Resend } from "resend";

// Resend SDK / Turnstile 検証のため Node.js ランタイムで動かす。
// このサイトで唯一の動的ルート（他ページはすべて SSG）。
export const runtime = "nodejs";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Turnstile 検証 API のタイムアウト（ミリ秒）。応答が返らないまま待ち続けないための上限 */
const TURNSTILE_TIMEOUT_MS = 5000;

const LIMITS = {
    name: 100,
    company: 100,
    email: 254,
    message: 2000,
} as const;

// ローカルパート@ドメイン の最低限の形式チェック（厳密な RFC 準拠は狙わない）
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
    name: string;
    company: string;
    email: string;
    message: string;
    /** Honeypot。人間が触れない欄なので空であるはず */
    website: string;
    /** Turnstile のトークン */
    token: string;
};

function asString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

/**
 * メールヘッダ（Subject）へ埋め込む文字列から改行・制御文字を除去する。
 * trim() は文字列内部の改行を落とさないため、ヘッダインジェクション対策としてここで潰す。
 */
function toHeaderSafe(value: string): string {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: ヘッダに混入させない目的で制御文字を明示的に除去する
    return value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
}

/** 受け取った JSON を検証して正規化する。問題があればエラーメッセージを返す */
function parsePayload(body: unknown): { data: ContactPayload } | { error: string } {
    if (typeof body !== "object" || body === null) {
        return { error: "リクエストの形式が正しくありません。" };
    }
    const raw = body as Record<string, unknown>;
    const data: ContactPayload = {
        name: asString(raw.name),
        company: asString(raw.company),
        email: asString(raw.email),
        message: asString(raw.message),
        website: asString(raw.website),
        token: asString(raw.token),
    };

    if (!data.name || data.name.length > LIMITS.name) {
        return { error: "お名前を確認してください。" };
    }
    if (data.company.length > LIMITS.company) {
        return { error: "会社名を確認してください。" };
    }
    if (!data.email || data.email.length > LIMITS.email || !EMAIL_PATTERN.test(data.email)) {
        return { error: "メールアドレスを確認してください。" };
    }
    if (!data.message || data.message.length > LIMITS.message) {
        return { error: "お問い合わせ内容を確認してください。" };
    }
    return { data };
}

/** Honeypot からボット送信を判定する */
function looksLikeBot(data: ContactPayload): string | null {
    if (data.website !== "") {
        return "honeypot filled";
    }
    return null;
}

async function verifyTurnstile(token: string, remoteIp: string | null, secret: string) {
    const form = new URLSearchParams({ secret, response: token });
    if (remoteIp) {
        form.set("remoteip", remoteIp);
    }
    const res = await fetch(TURNSTILE_VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
        signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS),
    });
    const result = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    return result;
}

function buildMailText(data: ContactPayload) {
    return [
        "ポートフォリオサイトのお問い合わせフォームから送信されました。",
        "",
        `お名前: ${data.name}`,
        `会社名: ${data.company || "（未入力）"}`,
        `メールアドレス: ${data.email}`,
        "",
        "お問い合わせ内容:",
        data.message,
    ].join("\n");
}

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "リクエストの形式が正しくありません。" },
            { status: 400 },
        );
    }

    const parsed = parsePayload(body);
    if ("error" in parsed) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const data = parsed.data;

    // ボット判定は Turnstile 検証より前に行う。
    // 検知を悟らせないため、理由は返さず成功と同じレスポンスを返してメールは送らない。
    const botReason = looksLikeBot(data);
    if (botReason) {
        console.warn(`[contact] bot submission blocked: ${botReason}`);
        return NextResponse.json({ ok: true });
    }

    if (!data.token) {
        return NextResponse.json({ error: "認証が完了していません。" }, { status: 400 });
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL;
    if (!turnstileSecret || !resendApiKey || !to || !from) {
        // 起動時ではなくハンドラ内で検出する（環境変数未設定でも next build を壊さないため）
        console.error("[contact] required environment variables are missing");
        return NextResponse.json({ error: "送信に失敗しました。" }, { status: 500 });
    }

    try {
        const remoteIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
        const verification = await verifyTurnstile(data.token, remoteIp, turnstileSecret);
        if (verification.success !== true) {
            console.warn(
                `[contact] turnstile verification failed: ${
                    verification["error-codes"]?.join(", ") ?? "unknown"
                }`,
            );
            return NextResponse.json(
                { error: "認証に失敗しました。ページを再読み込みしてお試しください。" },
                { status: 400 },
            );
        }

        const resend = new Resend(resendApiKey);
        const { error } = await resend.emails.send({
            from,
            to,
            replyTo: data.email,
            subject: `【お問い合わせ】${toHeaderSafe(data.name)} 様`,
            text: buildMailText(data),
        });
        if (error) {
            console.error("[contact] resend error:", error);
            return NextResponse.json({ error: "送信に失敗しました。" }, { status: 500 });
        }
    } catch (e) {
        console.error("[contact] unexpected error:", e);
        return NextResponse.json({ error: "送信に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
