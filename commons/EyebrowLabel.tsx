import type { ReactNode } from "react";
import { Text } from "./Text";

export function EyebrowLabel({ children }: { children: ReactNode }) {
    return (
        <Text
            as="div"
            variant="monoSm"
            tone="accent"
            className="flex items-center gap-2.5 tracking-label"
        >
            <span className="inline-block w-1.5 h-1.5 shrink-0 rounded-full bg-indigo-600 ring-4 ring-indigo-600/15" />
            {children}
        </Text>
    );
}
