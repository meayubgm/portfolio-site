import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 上位ディレクトリの package-lock.json を誤検出しないよう、ルートを固定
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
