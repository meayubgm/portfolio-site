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
        <div className="pt-24">
            {/* カードと同じグリッド（lg 以上で 6 カラム）に乗せ、文の開始位置をカード左端に揃える */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                <PageHeader
                    className="lg:col-span-4 lg:col-start-2"
                    size="list"
                    eyebrow="contact"
                    title="お問い合わせ"
                    lead="お仕事のご相談・ご質問など、お気軽にご連絡ください。"
                />
            </div>

            <CardGrid>
                {/* lg 以上では 6 カラム中 4 カラム分を 2 列目から。左右に1カラムずつ余白が残り中央に揃う */}
                <GlassCard span={4} start={2} padding="lg" hoverEffects={false}>
                    <ContactForm />
                </GlassCard>
            </CardGrid>

            <BackLink href="/">back to home</BackLink>
        </div>
    );
}
