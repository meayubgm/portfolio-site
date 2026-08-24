import { cn } from "@/lib/cn";
import { Tag } from "./Tag";

type TagListProps = {
    tags: string[];
    className?: string;
};

/** 技術スタックのタグを横に折り返しながら並べる列。Home / Works / ケーススタディで共用 */
export function TagList({ tags, className }: TagListProps) {
    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
            ))}
        </div>
    );
}
