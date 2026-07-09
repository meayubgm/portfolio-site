import { Button } from "@/components/Button";
import { CardLabel } from "@/components/CardLabel";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { GlassCard } from "@/components/GlassCard";
import { LinkRow } from "@/components/LinkRow";
import { SkillBar } from "@/components/SkillBar";
import { Tag } from "@/components/Tag";

const SHOW_AVAILABILITY = true;

export default function Home() {
  return (
    <div>
      <header className="pt-[88px] pb-16">
        {SHOW_AVAILABILITY && (
          <div className="mb-[22px]">
            <EyebrowLabel>available for new roles</EyebrowLabel>
          </div>
        )}
        <h1 className="m-0 mb-6 max-w-[840px] font-display text-[clamp(38px,5.4vw,60px)] font-semibold leading-[1.14] tracking-[-0.03em]">
          要件のヒアリングから、
          <span className="relative">
            デザインと実装
            <span className="absolute right-0 top-[-22px] whitespace-nowrap font-mono text-[10.5px] text-indigo">
              {"// design × code"}
            </span>
          </span>
          まで。
        </h1>
        <p className="m-0 mb-[18px] font-mono text-[15px] text-slate-soft">
          フロントエンドエンジニア／阿由葉 萌
        </p>
        <p className="m-0 mb-10 max-w-[620px] text-[16.5px] leading-[1.8] text-slate">
          React・Next.js・TypeScriptを中心に、受託開発でフロントエンド実装を担当。要件のヒアリングからUIデザイン、実装、テストまで一貫して対応できることが強みです。デザインカンプ作成やアイコン制作もAdobe
          XD・Figma・Illustratorで自ら手がけ、「デザインの意図を汲んだ実装」と「実装を前提にしたデザイン」の両方ができる立場で開発に関わっています。
        </p>
        <div className="flex gap-[14px]">
          <Button variant="primary" href="/works">
            Work を見る
          </Button>
          <Button variant="ghost">連絡する</Button>
        </div>
      </header>

      <section className="grid grid-cols-6 gap-4 pb-[90px]">
        <GlassCard span={4} padding="lg">
          <CardLabel>about</CardLabel>
          <p className="m-0 mt-1.5 max-w-[480px] font-display text-[21px] font-medium leading-[1.55] text-navy">
            「デザインの意図を汲んだ実装」と「実装を前提にしたデザイン」、
            <b className="font-semibold text-glow-c">その両方の立場で会話できる</b>のが強みです。
          </p>
          <p className="m-0 mt-[22px] text-[14.5px] leading-[1.7] text-slate">
            受託開発で企画〜デザイン〜実装を一貫して担当。仕組み化と丁寧な言語化を大事にしながら、着実にプロダクトの質を積み上げます。
          </p>
        </GlassCard>

        <GlassCard
          span={2}
          href="/works/brew"
          className="bg-[linear-gradient(160deg,rgba(107,174,219,0.14),rgba(255,255,255,0.55))]"
        >
          <CardLabel>featured work — 個人開発</CardLabel>
          <h3 className="m-0 mb-[10px] font-display text-[20px] font-semibold">
            コーヒー抽出タイマー
            <br />
            アプリ「BREW」
          </h3>
          <p className="m-0 text-[14px] leading-[1.7] text-slate">
            企画・要件定義・UIデザイン・実装まで一人で担当。ケーススタディを見る ↗
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Tag>React Native</Tag>
            <Tag>Expo</Tag>
            <Tag>TypeScript</Tag>
          </div>
        </GlassCard>

        <GlassCard span={2}>
          <CardLabel>engineering</CardLabel>
          <h3 className="m-0 mb-[10px] font-display text-[20px] font-semibold">Engineering</h3>
          <p className="m-0 mb-3 text-[13px] leading-[1.6] text-slate-soft">実務での使用経験ベースで記載</p>
          <div className="flex flex-col gap-[10px]">
            <SkillBar name="React / Next.js — 2023年〜" percent={88} />
            <SkillBar name="TypeScript" percent={82} />
            <SkillBar name="Laravel / PHP" percent={70} />
          </div>
        </GlassCard>

        <GlassCard span={2}>
          <CardLabel>design</CardLabel>
          <h3 className="m-0 mb-[10px] font-display text-[20px] font-semibold">Design</h3>
          <p className="m-0 mb-3 text-[13px] leading-[1.6] text-slate-soft">
            デザインカンプ・アイコン制作で実務使用
          </p>
          <div className="flex flex-col gap-[10px]">
            <SkillBar name="Figma" percent={85} />
            <SkillBar name="Adobe XD" percent={80} />
            <SkillBar name="Illustrator" percent={72} />
          </div>
        </GlassCard>

        <GlassCard span={2} className="flex flex-col justify-between">
          <div>
            <CardLabel>contact</CardLabel>
            <h3 className="m-0 mb-[10px] font-display text-[20px] font-semibold">Let&apos;s talk</h3>
            <p className="m-0 text-[14.5px] leading-[1.7] text-slate">お気軽にご連絡ください。</p>
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
