import type { ReactNode } from "react";
import { Text } from "@/commons/Text";

type FormFieldProps = {
    /** input / textarea の id。label と紐づける */
    id: string;
    /** 日本語のラベル（例: お名前） */
    label: ReactNode;
    /** 未指定なら必須扱い */
    optional?: boolean;
    /** 検証エラーの文言。渡されたときだけコントロールの下に表示する */
    error?: string;
    children: ReactNode;
};

/** フォーム入力コントロールに共通で当てるクラス（input / textarea 双方で使う） */
export const formControlClass =
    "w-full rounded-lg border border-sky-700/15 bg-white/60 px-3.5 py-2.5 font-body text-sm text-slate-900 backdrop-blur-xs outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-600 disabled:cursor-not-allowed disabled:opacity-60";

/** エラーメッセージの要素 id。input 側の aria-describedby と揃える */
export function errorId(id: string) {
    return `${id}-error`;
}

/** ラベル + 必須 / 任意の注記 + 入力コントロール + エラーメッセージのフォーム行。 */
export function FormField({ id, label, optional = false, error, children }: FormFieldProps) {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="mb-1.5 flex items-baseline gap-2">
                <Text as="span" variant="formLabel" tone="strong">
                    {label}
                </Text>
                <Text as="span" variant="monoSm" tone={optional ? "muted" : "accent"}>
                    {optional ? "// 任意" : "// 必須"}
                </Text>
            </label>
            {children}
            {error && (
                <Text id={errorId(id)} role="alert" variant="note" tone="danger" className="mt-1.5">
                    {error}
                </Text>
            )}
        </div>
    );
}
