import { resolveBackendImageLink } from '@/helpers/ImageLinkResolver';

const defaultAvatar = require('@/assets/images/DefaultImage.png') as string;

export function resolveUserAvatarSrc(imageUrl: string | null | undefined): string {
    const resolved = resolveBackendImageLink(imageUrl);
    return resolved || defaultAvatar;
}
