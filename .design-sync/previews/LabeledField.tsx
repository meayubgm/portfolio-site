import { LabeledField } from "portfolio-site";

export function Single() {
    return (
        <div style={{ maxWidth: 420 }}>
            <LabeledField label="// role">
                デザインカンプ作成／アイコン制作／詳細設計／フロントエンド実装
            </LabeledField>
        </div>
    );
}

export function Stacked() {
    return (
        <div style={{ maxWidth: 420 }}>
            <LabeledField label="// role" className="mt-4">
                モック作成、フロントエンド／バックエンド開発・修正
            </LabeledField>
            <LabeledField label="// point">モック作成から実装までを一貫して担当。</LabeledField>
        </div>
    );
}
