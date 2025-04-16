import {Property} from "@/components/Profile/ViewModels/Property";

export class GenericSortableDataClass<T> {
    constructor(
        public readonly data: T[],
        public readonly sortingProperties: () => { [key: string]: (dataUnit: T) => string | number | Property[] },
        public readonly defaultSortBy: string,) {
    }

    public GetSortedBy(sortingPropertyName: string): T[] {
        const GetSortingProperty = this.sortingProperties();

        return this.data.sort((a, b) => {
            const A = GetSortingProperty[sortingPropertyName](a)
            const B = GetSortingProperty[sortingPropertyName](b)

            if (A < B) {
                return -1;
            } else if (A > B) {
                return 1;
            }

            return 0;
        })
    }
}