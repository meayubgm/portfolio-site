import type { ReactNode } from "react";
import { Text } from "./Text";

export function CardLabel({ children }: { children: ReactNode }) {
    return (
        <Text
            as="span"
            variant="monoSm"
            tone="accent"
            className="block mb-3.5 uppercase tracking-label"
        >
            {children}
        </Text>
    );
}
