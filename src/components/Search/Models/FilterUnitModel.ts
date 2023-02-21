export default class FilterUnitModel {
    constructor(
        public Name: String,
        public Type: String,
        public Values: Map<string, boolean>) { }
}