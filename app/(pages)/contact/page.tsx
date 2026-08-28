import { BackLink } from "@/commons/BackLink";
import { CardGrid } from "@/commons/CardGrid";
import { GlassCard } from "@/commons/GlassCard";
import { Phrase } from "@/commons/Phrase";
import { ContactForm } from "@/components/ContactForm";
import { PageHeader } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
    path: "/contact",
    title: "お問い合わせ",
    description:
        "お仕事のご相談・ご依頼はこちらのフォームからお送りください。内容を確認のうえ、ご記入いただいたメールアドレス宛にご返信します。",
});

export default function Contact() {
    return (
        <div className="pt-24">
            {/* カードと同じグリッド（lg 以上で 6 カラム）に乗せ、文の開始位置をカード左端に揃える */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                <PageHeader
                    className="lg:col-span-4 lg:col-start-2"
                    size="list"
                    eyebrow="contact"
                    title={<Phrase>お問い合わせ</Phrase>}
                    lead={<Phrase>お仕事のご相談・ご質問など、お気軽にご連絡ください。</Phrase>}
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
