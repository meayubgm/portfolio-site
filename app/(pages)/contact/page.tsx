import type { Metadata } from "next";
import { BackLink } from "@/commons/BackLink";
import { CardGrid } from "@/commons/CardGrid";
import { GlassCard } from "@/commons/GlassCard";
import { ContactForm } from "@/components/ContactForm";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
    title: "お問い合わせ — Megumi Ayuha",
};

export default function Contact() {
    return (
        <div>
            <BackLink href="/">home に戻る</BackLink>

            {/* カードと同じ 6 カラムグリッドに乗せ、文の開始位置をカード左端に揃える */}
            <div className="grid grid-cols-6 gap-4">
                <PageHeader
                    className="col-span-4 col-start-2"
                    size="list"
                    eyebrow="contact"
                    title="お問い合わせ"
                    lead="お仕事のご相談・ご質問など、お気軽にご連絡ください。"
                />
            </div>

            <CardGrid>
                {/* 6カラム中4カラム分を 2 列目から。左右に1カラムずつ余白が残り中央に揃う */}
                <GlassCard span={4} start={2} padding="lg" hoverEffects={false}>
                    <ContactForm />
                </GlassCard>
            </CardGrid>
        </div>
    );
}
