import {FilterTypes} from "@/components/Search/Models/FilterTypes";

export default class FilterUnitModel<TValues> {
    constructor(
        public key: string,
        public selectedValue: String,
        public type: typeof FilterTypes,
        public selectableValues: Map<TValues, boolean>,
        public isMenuDropped: boolean) { }
}