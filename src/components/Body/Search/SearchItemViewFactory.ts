import {V1GetByQueryResponseContent} from "@/api/Requests/V1GetByQueryResponse";
import {SearchItemViewModel} from "@/components/Body/Search/ViewModels/SearchItemViewModel";
import moment from "moment";
import {Country} from "@/api/Enums/Country";
import {QueryContent} from "@/api/BaseQuery/QueryContent";
import {V1GetMainPageContentContent} from "@/api/Responses/V1GetMainPageContentResponse";

export class SearchContentFactory {
    static mapToViewModel(content: V1GetMainPageContentContent) : SearchItemViewModel  {
        let description: string[] = [];

        if (content.Content.ReleasedAt) {
            description.push(moment(new Date(content.Content.ReleasedAt)).format('YYYY'));
        }
        if (content.Content.Country && content.Content.Country.toString() != Country.Null.toString()) {
            description.push(content.Content.Country.toString())
        }
        if (content.Content.EngTitle) {
            description.push(content.Content.EngTitle);
        }
        if (content.Content.OriginTitle){
            description.push(content.Content.OriginTitle);
        }

        return {
            Id: content.Content.Id,
            ImageId: content.Content.ImageId,
            Title: content.Content.Title,
            Description: description.join(' / '),
            Translates: [],
            Genres: content.Genres.join(' / '),
            MinAge: content.Content.MinAgeLimit,
            SeriesCounter: content.Content.OutSeries + '/' + content.Content.PlannedSeries
        };
    }

    static getContentViewModel(content: V1GetByQueryResponseContent) : SearchItemViewModel {
        let description: string[] = [];

        if (content.Content.ReleasedAt) {
            description.push(moment(new Date(content.Content.ReleasedAt)).format('YYYY'));
        }
        if (content.Content.Country && content.Content.Country.toString() != Country.Null.toString()) {
            description.push(content.Content.Country.toString())
        }
        if (content.Content.EngTitle) {
            description.push(content.Content.EngTitle);
        }
        if (content.Content.OriginTitle){
            description.push(content.Content.OriginTitle);
        }

        let seriesCounter = content.Content.OutSeries + '/' + content.Content.PlannedSeries;

        return {
            Id: content.Content.Id,
            ImageId: content.Content.ImageId,
            Title: content.Content.Title,
            Description: description.join(' / '),
            Translates: content.Translations.map(x => x.Language.toString()),
            Genres: content.Genres.map(x => x.Name).join(' / '),
            MinAge: content.Content.MinAgeLimit >= 0 ? content.Content.MinAgeLimit : null,
            SeriesCounter: seriesCounter
        };
    }
}
