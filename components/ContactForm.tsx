"use client";

import Script from "next/script";
import { type FormEvent, useCallback, useRef, useState } from "react";
import { Button } from "./Button";
import { FormField, formControlClass } from "./FormField";

declare global {
    interface Window {
        turnstile?: {
            render: (
                el: HTMLElement,
                options: {
                    sitekey: string;
                    callback: (token: string) => void;
                    "expired-callback"?: () => void;
                    "error-callback"?: () => void;
                },
            ) => string;
            reset: (widgetId?: string) => void;
        };
    }
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type Status = "idle" | "sending" | "success" | "error";

const initialValues = { name: "", company: "", email: "", message: "" };

export function ContactForm() {
    const [values, setValues] = useState(initialValues);
    // Honeypot。人間には見えない欄なので、値が入っていればボットとみなす
    const [website, setWebsite] = useState("");
    const [token, setToken] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const widgetRef = useRef<HTMLDivElement | null>(null);
    const widgetId = useRef<string | null>(null);

    const renderWidget = useCallback(() => {
        if (!widgetRef.current || !window.turnstile || widgetId.current !== null || !siteKey) {
            return;
        }
        widgetId.current = window.turnstile.render(widgetRef.current, {
            sitekey: siteKey,
            callback: (t) => setToken(t),
            "expired-callback": () => setToken(""),
            "error-callback": () => setToken(""),
        });
    }, []);

    // トークンは一度きりなので、送信に失敗したらウィジェットを引き直す
    const resetWidget = useCallback(() => {
        setToken("");
        if (window.turnstile && widgetId.current !== null) {
            window.turnstile.reset(widgetId.current);
        }
    }, []);

    const update = (key: keyof typeof initialValues) => (value: string) =>
        setValues((prev) => ({ ...prev, [key]: value }));

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (status === "sending") {
            return;
        }
        setStatus("sending");
        setErrorMessage("");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    website,
                    token,
                }),
            });
            const data = (await res.json()) as { ok?: boolean; error?: string };
            if (!res.ok) {
                setErrorMessage(data.error ?? "送信に失敗しました。");
                setStatus("error");
                resetWidget();
                return;
            }
            setStatus("success");
        } catch {
            setErrorMessage("通信に失敗しました。時間をおいてお試しください。");
            setStatus("error");
            resetWidget();
        }
    }

    if (status === "success") {
        return (
            <div data-testid="contact-success">
                <p className="m-0 mb-3 font-mono text-[12px] text-indigo-600">{"// sent"}</p>
                <h2 className="m-0 mb-3 font-display text-[20px] font-semibold text-slate-900">
                    送信しました
                </h2>
                <p className="m-0 text-[14.5px] leading-[1.75] text-slate-600">
                    お問い合わせありがとうございます。内容を確認のうえ、3営業日以内にご記入いただいた
                    メールアドレス宛にご返信します。
                </p>
            </div>
        );
    }

    const sending = status === "sending";

    return (
        <>
            {siteKey ? (
                <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                    strategy="afterInteractive"
                    onReady={renderWidget}
                />
            ) : null}

            <form onSubmit={handleSubmit} noValidate={false}>
                <FormField id="contact-name" label="お名前">
                    <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        maxLength={100}
                        autoComplete="name"
                        disabled={sending}
                        value={values.name}
                        onChange={(e) => update("name")(e.target.value)}
                        className={formControlClass}
                    />
                </FormField>

                <FormField id="contact-company" label="会社名" optional>
                    <input
                        id="contact-company"
                        name="company"
                        type="text"
                        maxLength={100}
                        autoComplete="organization"
                        disabled={sending}
                        value={values.company}
                        onChange={(e) => update("company")(e.target.value)}
                        className={formControlClass}
                    />
                </FormField>

                <FormField id="contact-email" label="メールアドレス">
                    <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        maxLength={254}
                        autoComplete="email"
                        disabled={sending}
                        value={values.email}
                        onChange={(e) => update("email")(e.target.value)}
                        className={formControlClass}
                    />
                </FormField>

                <FormField id="contact-message" label="お問い合わせ内容">
                    <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={7}
                        maxLength={2000}
                        disabled={sending}
                        value={values.message}
                        onChange={(e) => update("message")(e.target.value)}
                        className={`${formControlClass} resize-y`}
                    />
                </FormField>

                {/*
                  Honeypot: 人間には見えず、キーボード・スクリーンリーダーからも到達できない欄。
                  display:none を検出するボットがあるため画面外に送る方式にしている。触らないこと。
                */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                    <label htmlFor="contact-website">Website</label>
                    <input
                        id="contact-website"
                        name="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                    />
                </div>

                {siteKey ? (
                    <div ref={widgetRef} className="mt-5" />
                ) : (
                    <p className="mt-5 mb-0 font-mono text-[12px] text-slate-500">
                        {"// NEXT_PUBLIC_TURNSTILE_SITE_KEY が未設定です"}
                    </p>
                )}

                <div className="mt-6 flex items-center gap-4">
                    <Button type="submit" disabled={sending}>
                        {sending ? "送信中..." : "送信する"}
                    </Button>
                    <p aria-live="polite" className="m-0 text-[13px] leading-[1.6] text-slate-600">
                        {status === "error" ? (
                            <span className="text-indigo-600">{errorMessage}</span>
                        ) : null}
                    </p>
                </div>
            </form>
        </>
    );
}
