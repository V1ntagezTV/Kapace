import {Property} from "@/components/Profile/ViewModels/Property";
import {LinkPropertyType} from "@/components/Profile/ViewModels/LinkPropertyType";

export class LinkedProperty extends Property {
    constructor(
        public readonly value: string,
        public readonly LinkType: LinkPropertyType,
        public readonly LinkId: bigint) {
        super(value);
    }
}