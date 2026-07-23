import { LinkRow } from "portfolio-site";

export function Single() {
    return (
        <div style={{ maxWidth: 320 }}>
            <LinkRow href="#" first>
                GitHub
            </LinkRow>
        </div>
    );
}

export function List() {
    return (
        <div style={{ maxWidth: 320 }}>
            <LinkRow href="#" first>
                Email
            </LinkRow>
            <LinkRow href="#">GitHub</LinkRow>
            <LinkRow href="#">Zenn</LinkRow>
        </div>
    );
}
