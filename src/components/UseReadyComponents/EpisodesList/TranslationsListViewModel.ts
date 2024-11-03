import {V1GetByEpisodeResponseEpisode, V1GetByEpisodeResponseTranslator} from "@/api/Responses/V1GetByEpisodeResponse";

export type Translation = {
    EpisodeId: number,
    Number: number,
    Title: string,
    Views: number,
    Stars: number,
    HasTranslations: boolean
}

export const Order = {
    ByAge: 'По возрастанию',
    ByWatches: 'По просмотрам',
    ByNumber: 'По убыванию',
    ByStars: 'По оценке',
} as const;

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
        }))
        .sort(function (left, right) {
            return left.Number > right.Number ? 1 : -1;
        });
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