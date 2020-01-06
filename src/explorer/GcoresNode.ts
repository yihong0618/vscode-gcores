export class GcoresNode {

    constructor(private data: string, private isProblemNode: boolean = true) { }

    public get locked(): boolean {
        return this.data === "2";
    }
    public get name(): string {
        return this.data;
    }

    public get state(): string {
        return this.data;
    }

    public get id(): string {
        return this.data;
    }
}
