"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Script from "next/script";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { CONTACT_LIMITS, type ContactInput, contactSchema } from "@/lib/contactSchema";
import { Button } from "./Button";
import { errorId, FormField, formControlClass } from "./FormField";

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

const initialValues: ContactInput = { name: "", company: "", email: "", message: "" };

export function ContactForm() {
    // Honeypot。人間には見えない欄なので、値が入っていればボットとみなす
    const [website, setWebsite] = useState("");
    const [token, setToken] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [errorMessage, setErrorMessage] = useState("");

    // 検証は送信ボタン押下時（RHF の既定の mode: onSubmit）。
    // 一度エラーが出た項目は、以降の入力に応じて再検証される（reValidateMode: onChange）。
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ContactInput>({
        resolver: zodResolver(contactSchema),
        defaultValues: initialValues,
    });

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

    // 検証を通過した値だけがここに来る。値は Zod が trim 済み
    async function onSubmit(values: ContactInput) {
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
                    お問い合わせありがとうございます。
                    <br />
                    内容を確認のうえ、ご記入いただいたメールアドレス宛にご返信します。
                </p>
            </div>
        );
    }

    const sending = isSubmitting || status === "sending";

    /** エラー時に aria-describedby でメッセージを読み上げに紐づける */
    const describedBy = (id: string, hasError: boolean) => (hasError ? errorId(id) : undefined);

    return (
        <>
            {siteKey ? (
                <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                    strategy="afterInteractive"
                    onReady={renderWidget}
                />
            ) : null}

            {/* noValidate: ブラウザ標準の検証 UI を止め、Zod のメッセージだけを出す */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <FormField id="contact-name" label="お名前" error={errors.name?.message}>
                    <input
                        id="contact-name"
                        type="text"
                        required
                        maxLength={CONTACT_LIMITS.name}
                        autoComplete="name"
                        disabled={sending}
                        aria-invalid={errors.name ? "true" : undefined}
                        aria-describedby={describedBy("contact-name", !!errors.name)}
                        className={formControlClass}
                        {...register("name")}
                    />
                </FormField>

                <FormField
                    id="contact-company"
                    label="会社名"
                    optional
                    error={errors.company?.message}
                >
                    <input
                        id="contact-company"
                        type="text"
                        maxLength={CONTACT_LIMITS.company}
                        autoComplete="organization"
                        disabled={sending}
                        aria-invalid={errors.company ? "true" : undefined}
                        aria-describedby={describedBy("contact-company", !!errors.company)}
                        className={formControlClass}
                        {...register("company")}
                    />
                </FormField>

                <FormField id="contact-email" label="メールアドレス" error={errors.email?.message}>
                    <input
                        id="contact-email"
                        type="email"
                        required
                        maxLength={CONTACT_LIMITS.email}
                        autoComplete="email"
                        disabled={sending}
                        aria-invalid={errors.email ? "true" : undefined}
                        aria-describedby={describedBy("contact-email", !!errors.email)}
                        className={formControlClass}
                        {...register("email")}
                    />
                </FormField>

                <FormField
                    id="contact-message"
                    label="お問い合わせ内容"
                    error={errors.message?.message}
                >
                    <textarea
                        id="contact-message"
                        required
                        rows={7}
                        maxLength={CONTACT_LIMITS.message}
                        disabled={sending}
                        aria-invalid={errors.message ? "true" : undefined}
                        aria-describedby={describedBy("contact-message", !!errors.message)}
                        className={`${formControlClass} resize-y`}
                        {...register("message")}
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
                            <span className="text-red-500">{errorMessage}</span>
                        ) : null}
                    </p>
                </div>
            </form>
        </>
    );
}
