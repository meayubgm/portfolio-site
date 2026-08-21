import { Text } from "./Text";

type StatBlockProps = {
    number: string;
    label: string;
};

export function StatBlock({ number, label }: StatBlockProps) {
    return (
        <div className="flex flex-col gap-1">
            <Text as="span" variant="subTitle" tone="strong">
                {number}
            </Text>
            <Text as="span" variant="note" tone="muted">
                {label}
            </Text>
        </div>
    );
}
