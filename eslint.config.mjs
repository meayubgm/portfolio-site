// Next.js 固有ルール（Core Web Vitals 系）専任の ESLint 設定。
// 汎用 lint と format は Biome が担当し、ここでは @next/eslint-plugin-next の
// core-web-vitals ルールのみを適用する（react/a11y 等は Biome に一任）。
import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";

export default [
    { ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"] },
    {
        // TSX/JSX をパースするための parser 設定（型情報は不要な軽量構成）。
        files: ["**/*.{ts,tsx,js,jsx,mjs}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
    },
    // @next/eslint-plugin-next の Flat Config（plugins + core-web-vitals ルール）。
    nextPlugin.configs["core-web-vitals"],
];
