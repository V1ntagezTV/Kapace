export const FavoriteStatuses = {
    Stash: 'Общее',
    Loved: 'Любимое',
    Planned: 'В планах',
    Watching: 'В процессе',
    Paused: 'Отложено',
    Finished: 'Завершено',
    Dropped: 'Брошено'
} as const;

export enum FavoriteStatus {
    Stash = 0,
    Planned = 1,
    Watching = 2,
    Paused = 3,
    Finished = 4,
    Dropped = 5,
    Loved = 6,
}

type HeaderKey = keyof typeof FavoriteStatuses;

export function getFavoritesStatusKeyByValue(value: string): HeaderKey | undefined {
    return (Object.keys(FavoriteStatuses) as HeaderKey[]).find(
        (key) => FavoriteStatuses[key] === value
    );
}

export function getFavoriteStatusLabel(status: FavoriteStatus | string | null | undefined): string {
    if (status === null || status === undefined) {
        return '';
    }
    if (typeof status === 'string' && status in FavoriteStatuses) {
        return FavoriteStatuses[status as HeaderKey];
    }
    const statusKey = FavoriteStatus[status as FavoriteStatus];
    if (typeof statusKey === 'string') {
        return FavoriteStatuses[statusKey as HeaderKey] ?? '';
    }
    return '';
}