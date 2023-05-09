export class News {
    constructor(
        public id: number,
        public title: string,
        public description: string,
        public image: string,
        public contentId: number,
    ) {
    }
}