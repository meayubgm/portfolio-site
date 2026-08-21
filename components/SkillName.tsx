import { Text } from "@/commons/Text";

/** `/skills` のスキル名（バー無し・mono / indigo）。Home はバー付きの `SkillBar` を使う */
export function SkillName({ name }: { name: string }) {
    return (
        <Text as="span" variant="monoSm" tone="accent">
            {name}
        </Text>
    );
}
