import {Property} from "@/components/Profile/ViewModels/Property";

export class DataClass {
    constructor(
        public readonly id: bigint,
        public readonly key: string,
        public readonly value: Property[],
    ) { }
}

