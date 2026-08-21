import { z } from "zod";

/** 各入力の最大文字数。クライアントの maxLength と揃える */
export const CONTACT_LIMITS = {
    name: 100,
    company: 100,
    email: 254,
    message: 2000,
} as const;

// ローカルパート@ドメイン の最低限の形式チェック（厳密な RFC 準拠は狙わない）
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 入力4項目の検証ルール。ContactForm と Route Handler で共有する */
export const contactSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "お名前を入力してください。")
        .max(CONTACT_LIMITS.name, `お名前は${CONTACT_LIMITS.name}文字以内で入力してください。`),
    company: z
        .string()
        .trim()
        .max(
            CONTACT_LIMITS.company,
            `会社名は${CONTACT_LIMITS.company}文字以内で入力してください。`,
        ),
    email: z
        .string()
        .trim()
        .min(1, "メールアドレスを入力してください。")
        .max(
            CONTACT_LIMITS.email,
            `メールアドレスは${CONTACT_LIMITS.email}文字以内で入力してください。`,
        )
        .regex(EMAIL_PATTERN, "メールアドレスの形式が正しくありません。"),
    message: z
        .string()
        .trim()
        .min(1, "お問い合わせ内容を入力してください。")
        .max(
            CONTACT_LIMITS.message,
            `お問い合わせ内容は${CONTACT_LIMITS.message}文字以内で入力してください。`,
        ),
});

const PAYLOAD_KEYS = ["name", "company", "email", "message", "website", "token"] as const;

/**
 * 任意の JSON を「全キーが文字列のオブジェクト」に均す。
 * 型不一致で英語の既定メッセージが出るのを避け、未入力と同じ日本語メッセージに寄せる。
 */
function normalizePayload(value: unknown): Record<string, string> {
    const raw =
        typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
    return Object.fromEntries(
        PAYLOAD_KEYS.map((key) => [key, typeof raw[key] === "string" ? raw[key] : ""]),
    );
}

/** Route Handler が受け取る JSON。Honeypot と Turnstile のトークンを含む */
export const contactPayloadSchema = z.preprocess(
    normalizePayload,
    contactSchema.extend({
        // trim しない。空白だけを入れるボットも looksLikeBot() で検知するため
        /** Honeypot。人間が触れない欄なので空であるはず */
        website: z.string(),
        /** Turnstile のトークン */
        token: z.string().trim(),
    }),
);

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactPayload = z.infer<typeof contactPayloadSchema>;
