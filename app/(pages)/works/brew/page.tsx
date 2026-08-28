import type { Metadata } from "next";
import Image from "next/image";
import { BackLink } from "@/commons/BackLink";
import { BulletList } from "@/commons/BulletList";
import { LinkRow } from "@/commons/LinkRow";
import { MonoHeading } from "@/commons/MonoHeading";
import { Phrase } from "@/commons/Phrase";
import { TagList } from "@/commons/TagList";
import { Text } from "@/commons/Text";
import { HeroGeometry } from "@/components/HeroGeometry";
import { PageHeading } from "@/components/PageHeading";
import { brewCase } from "@/lib/cases";

export const metadata: Metadata = {
    title: "Coffee Brew Timer — コーヒー抽出タイマー | Megumi Ayuha",
};

const heroShots = [
    { src: "/works/brew/iPhone_14ProMax_mock_light_top.png", caption: "ホーム画面" },
    { src: "/works/brew/iPhone_14ProMax_mock_light_timer_1.png", caption: "タイマー画面1" },
    { src: "/works/brew/iPhone_14ProMax_mock_light_timer_2.png", caption: "タイマー画面2" },
];

export default function BrewCaseStudy() {
    return (
        <div className="pt-24">
            <div className="sm:px-4 lg:px-9">
                <header className="border-b border-dashed border-indigo-600/15 py-10">
                    <HeroGeometry page="brew" />
                    <PageHeading
                        size="detail"
                        eyebrow={`${brewCase.no} — 個人開発`}
                        title={
                            <>
                                {brewCase.titleEn}
                                <br />
                                <Phrase>{brewCase.titleJa}</Phrase>
                            </>
                        }
                        period={brewCase.period}
                        lead={<Phrase>{brewCase.summary}</Phrase>}
                    />
                    <TagList tags={brewCase.tags} />
                </header>
                <div className="flex flex-col gap-12 pb-12 pt-12 sm:pb-16">
                    <div className="rounded-card border border-dashed border-indigo-600/15 bg-white/55 p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {heroShots.map((shot) => (
                                <figure key={shot.src}>
                                    <Text
                                        as="figcaption"
                                        variant="monoSm"
                                        tone="accent"
                                        className="text-center"
                                    >
                                        {shot.caption}
                                    </Text>
                                    <Image
                                        src={shot.src}
                                        alt={shot.caption}
                                        width={1200}
                                        height={2037}
                                        sizes="(max-width: 640px) calc(100vw - 94px), (max-width: 1800px) 30vw, 528px"
                                        className="h-auto w-full"
                                    />
                                </figure>
                            ))}
                        </div>
                    </div>
                    <section>
                        <MonoHeading>{"// 開発背景・課題設定"}</MonoHeading>
                        <Text variant="lead" className="mb-4">
                            自分自身がスペシャルティコーヒーの抽出に関心があり、日常的に4:6メソッドや浸漬式ドリッパーなど複数の淹れ方を使い分けている中で、「湯量を自分で電卓を叩いて計算する必要がある」という不便さを感じたことが開発のきっかけです。
                        </Text>
                        <Text variant="lead">
                            「豆の量・人数を入力するだけで抽出方法に合わせた湯量が算出され、湯を注ぐタイミングを音で教えてくれる」体験を作ることを目標に、個人開発として企画から着手しました。
                        </Text>
                    </section>
                    <section>
                        <MonoHeading>{"// 要件定義"}</MonoHeading>
                        <BulletList className="mb-4">
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
                        </BulletList>
                        <Text variant="lead">
                            工程を通じて意識したのは、単なるタイマーではなく「抽出ガイド」として機能させること。アラーム時に「今回注ぐ量」「累計注湯量」「次のステップまでの待機時間」をまとめて提示する設計にしました。
                        </Text>
                    </section>
                    <section>
                        <MonoHeading>{"// デザイン"}</MonoHeading>
                        <Text variant="lead" className="mb-4">
                            テラコッタを基調にライト/ダークテーマの配色を設計しました。理由はコーヒーの世界観との親和性（ドリッパーの陶器やレンガを思わせる血色の良い暖色）です。
                        </Text>
                        <Text variant="lead" className="mb-6">
                            HTML/CSSでインタラクティブなプロトタイプを先に作成し、タイマーの挙動・画面遷移をデザイン段階で検証してから実装に着手しました。
                        </Text>
                        <div className="rounded-card border border-dashed border-indigo-600/15 bg-white/55">
                            <Image
                                src="/works/brew/coffee_showcase.png"
                                alt="テラコッタUIのライト/ダークテーマ画面一覧"
                                width={2560}
                                height={2040}
                                sizes="(max-width: 640px) calc(100vw - 46px), (max-width: 1800px) calc(100vw - 136px), 1664px"
                                className="h-auto w-full rounded-card"
                            />
                        </div>
                    </section>
                    <section>
                        <MonoHeading>{"// 技術選定"}</MonoHeading>
                        <div className="flex flex-col">
                            <div className="border-t border-dashed border-indigo-600/15 py-3.5">
                                <Text variant="labelStrong" tone="strong" className="mb-1">
                                    Web MVP — React + TypeScript + Vite
                                </Text>
                                <Text variant="body">
                                    型安全性を確保しつつ、開発中のビルド速度を優先。プロトタイプの検証速度を重視しVite採用。
                                </Text>
                            </div>
                            <div className="border-y border-dashed border-indigo-600/15 py-3.5">
                                <Text variant="labelStrong" tone="strong" className="mb-1">
                                    モバイル — React Native + Expo
                                </Text>
                                <Text variant="body">
                                    実機での動作確認・配布のしやすさを優先。Expo&nbsp;Goで実機検証しながら開発を進める前提で採用。
                                </Text>
                            </div>
                        </div>
                        <Text variant="lead" className="mt-4">
                            Web版とモバイル版でロジック（湯量計算・タイマー制御）を共通化できる設計を意識し、UIレイヤーのみをプラットフォームごとに分離する構成にしています。
                        </Text>
                    </section>
                    <section>
                        <MonoHeading>{"// 実装・実機検証"}</MonoHeading>
                        <Text variant="lead">
                            Expo&nbsp;Goを使ってAndroid実機上で動作確認を実施。画面遷移・湯量自動計算・タイマー進行を実機で検証し、抽出ステップに合わせたアラーム通知が正しいタイミングで発火することを確認しました。
                        </Text>
                    </section>
                    <section>
                        <MonoHeading>{"// 実装済み ／ 今後の実装予定"}</MonoHeading>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Text variant="labelStrong" tone="strong" className="mb-2">
                                    実装済み
                                </Text>
                                <BulletList variant="body">
                                    <li>複数抽出メソッドのプリセット選択</li>
                                    <li>人数・豆量に応じた湯量自動計算</li>
                                    <li>ステップタイマーとアラーム通知</li>
                                    <li>ユーザーカスタムプリセット機能</li>
                                    <li>Android実機での動作確認</li>
                                    <li>Web版のVercelデプロイ</li>
                                </BulletList>
                            </div>
                            <div>
                                <Text variant="labelStrong" tone="strong" className="mb-2">
                                    今後の実装予定
                                </Text>
                                <BulletList variant="body">
                                    <li>iOS/Androidのストア配信</li>
                                    <li>クラウド同期</li>
                                </BulletList>
                            </div>
                        </div>
                        {/* <Text variant="lead" className="mt-4">
                            コア体験である「抽出ガイド」機能の安定動作を優先し、カスタマイズ機能は意図的に後回しにしています。
                        </Text> */}
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

            <BackLink href="/works">back to works</BackLink>
        </div>
    );
}
