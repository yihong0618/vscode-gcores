import { Command } from "vscode";

export class GcoresNode {

    constructor(private data: string, private articleId: string, private isGcoresElementNode: boolean = true) { }

    public get name(): string {
        return this.data;
    }

    public get id(): string {
        return this.articleId;
    }

    public get isGcoresElement(): boolean {
        return this.isGcoresElementNode;
    }

    public get previewCommand(): Command {
        return {
            title: "Preview Article",
            command: "gcores.previewArticle",
            arguments: [this],
        };
    }
}
