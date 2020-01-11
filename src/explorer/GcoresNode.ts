import { Command } from "vscode";
import { IArticle } from "../shared";

export class GcoresNode {

    constructor(private data: IArticle, private isGcoresElementNode: boolean = true) { }

    public get name(): string {
        return this.data.name;
    }

    public get id(): string {
        return this.data.id;
    }

    public get likes(): number {
        return this.data.likesCount;
    }

    public get comments(): number {
        return this.data.commentsCount;
    }

    public get bookmarks(): number {
        return this.data.bookmarksCount;
    }

    public get isGcoresElement(): boolean {
        return this.isGcoresElementNode;
    }

    public get isHotElement(): boolean {
        if  (!this.isGcoresElement) {
            return false;
        }
        return this.data.likesCount >= 100 ||  this.data.commentsCount >= 100 || this.data.bookmarksCount >= 100;
    }

    public get previewCommand(): Command {
        return {
            title: "Preview Article",
            command: "gcores.previewArticle",
            arguments: [this],
        };
    }
}
