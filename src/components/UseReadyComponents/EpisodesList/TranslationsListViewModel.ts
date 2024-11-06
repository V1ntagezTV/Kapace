import {V1GetByEpisodeResponseEpisode, V1GetByEpisodeResponseTranslator} from "@/api/Responses/V1GetByEpisodeResponse";

export const ALL_FILTER = "Все";

export type Translation = {
    EpisodeId: number,
    Number: number,
    Title: string,
    Views: number,
    Stars: number,
    HasTranslations: boolean
}

export enum Order {
    ByNumber = 'По возрастанию',
    ByNumberDescending = 'По убыванию',
    ByViews = 'По просмотрам',
    ByStars = 'По оценке'
}

export enum EpisodeOrderType {
    ByNumber = 'ByNumber',
    ByNumberDescending = 'ByNumberDescending',
    ByStars = 'ByStars',
    ByViews = 'ByViews'
}

export function mapToEpisodeOrderType(value: Order) {
    if (value === Order.ByNumber) {
        return EpisodeOrderType.ByNumber;
    } else if (value === Order.ByNumberDescending) {
        return EpisodeOrderType.ByNumberDescending;
    } else if (value === Order.ByViews) {
        return EpisodeOrderType.ByViews;
    } else if (value === Order.ByStars) {
        return EpisodeOrderType.ByStars;
    }
    return undefined;
}

export type Translator = {
    TranslatorId: number,
    Name: string,
}

export function mapToEpisodes(data: V1GetByEpisodeResponseEpisode[]) : Translation[] {
    return data
        .map(episode =>({
            EpisodeId: episode.Id,
            Number: episode.Number,
            Title: episode.Title,
            Views: episode.Views,
            Stars: episode.Stars,
            HasTranslations: episode.Translations ? (episode.Translations.length > 0) : false
        }));
}

export function mapToTranslators(
    data: V1GetByEpisodeResponseTranslator[],
    unknownTranslatorName: string = "Неизвестный переводчик")
    : Translator[] {
    return data.map(translator => ({
       TranslatorId: translator.Id,
       Name: translator.Name === null ? unknownTranslatorName : translator.Name
    }));
}