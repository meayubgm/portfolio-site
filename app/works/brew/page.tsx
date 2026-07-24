import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { LinkRow } from "@/components/LinkRow";
import { MonoHeading } from "@/components/MonoHeading";
import { PageHeading } from "@/components/PageHeading";
import { Tag } from "@/components/Tag";
import { brewCase } from "@/lib/cases";

export const metadata: Metadata = {
    title: "Coffee Brew Timer — コーヒー抽出タイマー | Megumi Ayuha",
};

function Body({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <p className={`m-0 text-[15px] leading-[1.9] text-slate-600 ${className}`}>{children}</p>
    );
}

const heroShots = [
    { src: "/works/brew/iPhone_14ProMax_mock_light_top.png", caption: "ホーム画面" },
    { src: "/works/brew/iPhone_14ProMax_mock_light_timer_1.png", caption: "タイマー画面1" },
    { src: "/works/brew/iPhone_14ProMax_mock_light_timer_2.png", caption: "タイマー画面2" },
];

function MediaPlaceholder({ label }: { label: string }) {
    return (
        <div className="rounded-card border border-dashed border-indigo-600/15 bg-white/55 px-6 py-12 text-center">
            <p className="m-0 font-mono text-[12px] text-indigo-600">[ GIF差し込み：{label} ]</p>
        </div>
    );
}

export default function BrewCaseStudy() {
    return (
        <div>
            <div className="pt-24">
                <Link href="/works" className="font-mono text-[12.5px] text-indigo-600">
                    ← works に戻る
                </Link>
            </div>

            <div className="px-9">
                <header className="border-b border-dashed border-indigo-600/15 py-10">
                    <PageHeading
                        size="detail"
                        eyebrow={`${brewCase.no} — 個人開発`}
                        title={
                            <>
                                {brewCase.titleEn}
                                <br />
                                {brewCase.titleJa}
                            </>
                        }
                        period={brewCase.period}
                        lead={brewCase.summary}
                    />
                    <div className="flex flex-wrap gap-2">
                        {brewCase.tags.map((t) => (
                            <Tag key={t}>{t}</Tag>
                        ))}
                    </div>
                </header>
                <div className="flex flex-col gap-12 pb-section pt-12">
                    <div className="rounded-card border border-dashed border-indigo-600/15 bg-white/55 p-6">
                        <div className="grid grid-cols-3 gap-4">
                            {heroShots.map((shot) => (
                                <figure key={shot.src} className="m-0">
                                    <figcaption className="text-center font-mono text-[12px] text-indigo-600">
                                        {shot.caption}
                                    </figcaption>
                                    <Image
                                        src={shot.src}
                                        alt={shot.caption}
                                        width={1707}
                                        height={2898}
                                        className="h-auto w-full"
                                    />
                                </figure>
                            ))}
                        </div>
                    </div>
                    <section>
                        <MonoHeading>{"// 開発背景・課題設定"}</MonoHeading>
                        <Body className="mb-4">
                            自分自身がスペシャルティコーヒーの抽出に関心があり、日常的に4:6メソッドや浸漬式ドリッパーなど複数の淹れ方を使い分けている中で、「湯量を自分で電卓を叩いて計算する必要がある」という不便さを感じたことが開発のきっかけです。
                        </Body>
                        <Body>
                            「豆の量・人数を入力するだけで抽出方法に合わせた湯量が算出され、湯を注ぐタイミングを音で教えてくれる」体験を作ることを目標に、個人開発として企画から着手しました。
                        </Body>
                    </section>
                    <section>
                        <MonoHeading>{"// 要件定義"}</MonoHeading>
                        <ul className="m-0 mb-4 list-disc pl-[1.3em] text-[15px] leading-[1.9] text-slate-600">
                            <li>
                                デフォルトで複数の抽出メソッド（4:6メソッド／浸漬式ドリッパー／エアロプレス／フレンチプレス）をプリセットとして用意
                            </li>
                            <li>
                                人数または豆量の入力から、メソッドごとの比率に応じて湯量を自動計算
                            </li>
                            <li>
                                タイマーはカウントアップ式とし、各ステップの注湯タイミングでアラーム通知
                            </li>
                            <li>
                                ユーザー独自の抽出レシピを保存できるカスタムプリセット機能（フェーズ2として設計）
                            </li>
                        </ul>
                        <Body>
                            工程を通じて意識したのは、単なるタイマーではなく「抽出ガイド」として機能させること。アラーム時に「今回注ぐ量」「累計注湯量」「次のステップまでの待機時間」をまとめて提示する設計にしました。
                        </Body>
                    </section>
                    <section>
                        <MonoHeading>{"// デザイン"}</MonoHeading>
                        <Body className="mb-4">
                            テラコッタを基調にライト/ダークテーマの配色を設計しました。理由はコーヒーの世界観との親和性（ドリッパーの陶器やレンガを思わせる血色の良い暖色）です。
                        </Body>
                        <Body className="mb-6">
                            HTML/CSSでインタラクティブなプロトタイプを先に作成し、タイマーの挙動・画面遷移をデザイン段階で検証してから実装に着手しました。
                        </Body>
                        <div className="rounded-card border border-dashed border-indigo-600/15 bg-white/55">
                            <Image
                                src="/works/brew/coffee_showcase.png"
                                alt="テラコッタUIのライト/ダークテーマ画面一覧"
                                width={2560}
                                height={2040}
                                sizes="(max-width: 1800px) 90vw, 1616px"
                                className="h-auto w-full rounded-card"
                            />
                        </div>
                    </section>
                    <section>
                        <MonoHeading>{"// 技術選定"}</MonoHeading>
                        <div className="flex flex-col">
                            <div className="border-t border-dashed border-indigo-600/15 py-3.5">
                                <p className="m-0 mb-1 text-[14px] font-semibold text-slate-900">
                                    Web MVP — React + TypeScript + Vite
                                </p>
                                <p className="m-0 text-sm leading-[1.7] text-slate-600">
                                    型安全性を確保しつつ、開発中のビルド速度を優先。プロトタイプの検証速度を重視しVite採用。
                                </p>
                            </div>
                            <div className="border-y border-dashed border-indigo-600/15 py-3.5">
                                <p className="m-0 mb-1 text-[14px] font-semibold text-slate-900">
                                    モバイル — React Native + Expo
                                </p>
                                <p className="m-0 text-sm leading-[1.7] text-slate-600">
                                    実機での動作確認・配布のしやすさを優先。Expo&nbsp;Goで実機検証しながら開発を進める前提で採用。
                                </p>
                            </div>
                        </div>
                        <Body className="mt-4">
                            Web版とモバイル版でロジック（湯量計算・タイマー制御）を共通化できる設計を意識し、UIレイヤーのみをプラットフォームごとに分離する構成にしています。
                        </Body>
                    </section>
                    <section>
                        <MonoHeading>{"// 実装・実機検証"}</MonoHeading>
                        <Body className="mb-6">
                            Expo&nbsp;Goを使ってAndroid実機上で動作確認を実施。画面遷移・湯量自動計算・タイマー進行を実機で検証し、抽出ステップに合わせたアラーム通知が正しいタイミングで発火することを確認しました。
                        </Body>
                        <MediaPlaceholder label="実機でタイマーが動作している様子" />
                    </section>
                    <section>
                        <MonoHeading>{"// 実装済み ／ 今後の実装予定"}</MonoHeading>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="m-0 mb-2 text-[14px] font-semibold">実装済み</p>
                                <ul className="m-0 list-disc pl-[1.3em] text-sm leading-[1.8] text-slate-600">
                                    <li>複数抽出メソッドのプリセット選択</li>
                                    <li>人数・豆量に応じた湯量自動計算</li>
                                    <li>ステップタイマーとアラーム通知</li>
                                    <li>ユーザーカスタムプリセット機能</li>
                                    <li>Android実機での動作確認</li>
                                    <li>Web版のVercelデプロイ</li>
                                </ul>
                            </div>
                            <div>
                                <p className="m-0 mb-2 text-[14px] font-semibold">今後の実装予定</p>
                                <ul className="m-0 list-disc pl-[1.3em] text-sm leading-[1.8] text-slate-600">
                                    <li>iOS/Androidのストア配信</li>
                                    <li>クラウド同期</li>
                                </ul>
                            </div>
                        </div>
                        {/* <Body className="mt-4">
                            コア体験である「抽出ガイド」機能の安定動作を優先し、カスタマイズ機能は意図的に後回しにしています。
                        </Body> */}
                    </section>
                    <section>
                        <MonoHeading>{"// コード・デモ"}</MonoHeading>
                        <div>
                            <LinkRow
                                first
                                external
                                href="https://coffee-brew-timer-native.vercel.app/"
                            >
                                デモ（Web） [リンク]
                            </LinkRow>
                            <LinkRow
                                external
                                href="https://github.com/meayubgm/coffee-brew-timer-native"
                            >
                                リポジトリ [GitHubリンク]
                            </LinkRow>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
