import { Button } from "@/components/Button";
import { CardLabel } from "@/components/CardLabel";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { GlassCard } from "@/components/GlassCard";
import { LinkRow } from "@/components/LinkRow";
import { SkillBar } from "@/components/SkillBar";
import { Tag } from "@/components/Tag";

export default function Home() {
  return (
    <div>
      <header className="pt-35 pb-20 h-screen flex flex-col justify-between">
        <div>
          <div className="pb-5.5">
            <EyebrowLabel>design × development</EyebrowLabel>
          </div>
          <h1 className="m-0 font-display text-[clamp(38px,5.4vw,60px)] font-medium leading-[1.14] tracking-[-0.03em]">
            意図を汲みとって、かたちにする
          </h1>
        </div>
        <div>
          <p className="m-0 pb-4.5 font-mono text-[15px] text-slate-500">
            Megumi Ayuha / Web Design × Frontend Development — Portfolio
          </p>
          <p className="m-0 pb-20 max-w-155 text-[16.5px] leading-[1.8] text-slate-600">
            ご覧いただきありがとうございます。<br/>
            デザイン理解を強みにしたフロントエンド実装、常にユーザビリティを意識したUI改善を大切にして開発に向き合っています。指示を受けた要件をそのまま実装するのではなく、指示の意図を汲み取ってより使いやすいUIを提案します。
          </p>
          <div className="flex gap-3.5">
            <Button variant="primary" href="/works">
              Works を見る
            </Button>
            <Button variant="ghost">連絡する</Button>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-6 gap-4 pb-22.5">
        <GlassCard span={4} padding="lg">
          <CardLabel>about</CardLabel>
          <p className="m-0 mt-1.5 font-display text-[21px] font-medium leading-[1.55] text-slate-900">
            「デザインの意図を汲んだ実装」と「実装を前提にしたデザイン」<br/>
            <b className="font-semibold text-sky-700">その両方の立場で会話できる</b>のが強みです
          </p>
          <p className="m-0 mt-5.5 text-[14.5px] leading-[1.7] text-slate-600">
            Webアプリケーションの受託開発で React / Next.js / TypeScript を中心に、主にフロントエンド開発を3年以上担当してきました。追加機能の 要件定義 / 基本設計 / 詳細設計 と、AdobeXD / Figma / Illustrator を用いた デザインカンプ / アイコン制作 も担当しています。<br/>
            丁寧な言語化とAIを活用した仕組み化を大切にしながら、着実にプロダクトの質を積み上げます。
          </p>
        </GlassCard>

        <GlassCard
          span={2}
          href="/works/brew"
          className="bg-[linear-gradient(160deg,rgba(107,174,219,0.14),rgba(255,255,255,0.55))]"
        >
          <CardLabel>featured work — 個人開発</CardLabel>
          <h3 className="m-0 mb-2.5 font-display text-[20px] font-semibold">
            コーヒー抽出タイマー
            <br />
            アプリ「BREW」
          </h3>
          <p className="m-0 text-sm leading-[1.7] text-slate-600">
            企画・要件定義・UIデザイン・実装まで一人で担当。ケーススタディを見る ↗
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Tag>React Native</Tag>
            <Tag>Expo</Tag>
            <Tag>TypeScript</Tag>
          </div>
        </GlassCard>

        <GlassCard span={2}>
          <CardLabel>development</CardLabel>
          <h3 className="m-0 mb-2.5 font-display text-[20px] font-semibold">Development</h3>
          <p className="m-0 mb-3 text-[13px] leading-[1.6] text-slate-500">
            実務での使用経験ベースで記載
          </p>
          <div className="flex flex-col gap-2.5">
            <SkillBar name="React / Next.js — 2023年〜" percent={88} />
            <SkillBar name="TypeScript" percent={82} />
            <SkillBar name="Laravel / PHP" percent={70} />
          </div>
        </GlassCard>

        <GlassCard span={2}>
          <CardLabel>design</CardLabel>
          <h3 className="m-0 mb-2.5 font-display text-[20px] font-semibold">Design</h3>
          <p className="m-0 mb-3 text-[13px] leading-[1.6] text-slate-500">
            デザインカンプ・アイコン制作で実務使用
          </p>
          <div className="flex flex-col gap-2.5">
            <SkillBar name="Figma" percent={85} />
            <SkillBar name="Adobe XD" percent={80} />
            <SkillBar name="Illustrator" percent={72} />
          </div>
        </GlassCard>

        <GlassCard span={2} className="flex flex-col justify-between">
          <div>
            <CardLabel>contact</CardLabel>
            <h3 className="m-0 mb-2.5 font-display text-[20px] font-semibold">Let&apos;s talk</h3>
            <p className="m-0 text-[14.5px] leading-[1.7] text-slate-600">
              お気軽にご連絡ください。
            </p>
          </div>
          <div>
            <LinkRow first>Email</LinkRow>
            <LinkRow>GitHub</LinkRow>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
