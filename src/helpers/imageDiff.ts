import { resolveBackendImageLink } from '@/helpers/ImageLinkResolver';

export type ImageFieldKind = 'avatar' | 'list' | 'text';

export type ImageListDiff = {
    removed: string[];
    added: string[];
};

const IMAGE_LIST_FIELD_NAMES = [
    'изображения',
    'дополнительные изображения',
    'additionalimagename',
    'additionalimagenames',
];

const AVATAR_FIELD_NAMES = [
    'изображение',
    'аватар',
    'avatarimagename',
    'avatar',
];

function normalizeFieldName(name: string): string {
    return name.trim().toLowerCase();
}

function looksLikeImageReference(value: string): boolean {
    if (/^https?:\/\//i.test(value)) {
        return true;
    }

    if (/\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(value)) {
        return true;
    }

    return value.includes('/') || value.includes('Image') || value.includes('image');
}

export function parseImageValues(value: string | null | undefined): string[] {
    if (!value?.trim()) {
        return [];
    }

    const trimmed = value.trim();

    if (trimmed.startsWith('[')) {
        try {
            const parsed = JSON.parse(trimmed) as unknown;
            if (Array.isArray(parsed)) {
                return parsed.map(item => String(item).trim()).filter(Boolean);
            }
        } catch {
            // fall through to delimiter parsing
        }
    }

    return trimmed
        .split(/[\n,;]+/)
        .map(item => item.trim())
        .filter(Boolean);
}

export function resolveImageSrc(value: string | null | undefined): string {
    if (!value?.trim()) {
        return '';
    }

    return resolveBackendImageLink(value.trim());
}

function normalizeImageKey(value: string): string {
    return resolveImageSrc(value) || value.trim();
}

export function computeImageListDiff(
    oldValue: string | null | undefined,
    newValue: string | null | undefined
): ImageListDiff {
    const oldItems = parseImageValues(oldValue).map(normalizeImageKey);
    const newItems = parseImageValues(newValue).map(normalizeImageKey);
    const newSet = new Set(newItems);
    const oldSet = new Set(oldItems);

    return {
        removed: oldItems.filter(item => !newSet.has(item)),
        added: newItems.filter(item => !oldSet.has(item)),
    };
}

export function detectImageFieldKind(
    name: string,
    oldValue?: string | null,
    newValue?: string | null
): ImageFieldKind {
    const normalizedName = normalizeFieldName(name);

    if (AVATAR_FIELD_NAMES.some(fieldName => normalizedName === fieldName || normalizedName.includes(fieldName))) {
        return 'avatar';
    }

    if (IMAGE_LIST_FIELD_NAMES.some(fieldName => normalizedName === fieldName || normalizedName.includes(fieldName))) {
        return 'list';
    }

    const oldItems = parseImageValues(oldValue);
    const newItems = parseImageValues(newValue);
    const allItems = [...oldItems, ...newItems];

    if (allItems.length === 0 || !allItems.every(looksLikeImageReference)) {
        return 'text';
    }

    if (oldItems.length <= 1 && newItems.length <= 1) {
        return 'avatar';
    }

    return 'list';
}
