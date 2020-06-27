/** Collection-ish */
export class Collection extends Map {
    public constructor() {
        super();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public find(func: (item: any) => boolean): any {
        for (const item of this.values()) {
            if (func(item)) {
                return item;
            }
        }
        return undefined;
    }
}