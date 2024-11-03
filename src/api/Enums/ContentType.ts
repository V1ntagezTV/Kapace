export const ContentType = {
    Film: 'Film',
    Documentary: 'Documentary',
    Serial: 'Serial',
    Show: 'Show',
} as const;

const ContentTypeRu = {
    Film: 'Фильм',
    Documentary: 'Документалка',
    Serial: 'Сериал',
    Show: 'Шоу',
}

export function mapContentTypeToRuStr(contentType: keyof typeof ContentType): string {
    return ContentTypeRu[contentType];
}