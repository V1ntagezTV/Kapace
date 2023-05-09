import {FilterTypes} from "@/components/Search/Models/FilterTypes";

export default class FilterUnitModel<TValues> {
    constructor(
        public name: String,
        public type: typeof FilterTypes,
        public values: Map<TValues, boolean>) { }
}