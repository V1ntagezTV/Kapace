export function resolveBackendImageLink(link: string | null | undefined): string {
    if (!link) {
        return "";
    }

    if (/^https?:\/\//i.test(link)) {
        return link;
    }

    const backend = process.env.VUE_APP_SERVER_API_ADDRESS ?? "";
    if (!backend) {
        return link;
    }

    return `${backend.replace(/\/+$/, "")}/${link.replace(/^\/+/, "")}`;
}

export function resolveBackendImageLinks(links: string[] | null | undefined): string[] {
    if (!links || links.length === 0) {
        return [];
    }

    return links.map(resolveBackendImageLink).filter(Boolean);
}

