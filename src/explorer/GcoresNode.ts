import { Command } from "vscode";
import { audioBaseMp3Url, IArticle } from "../shared/shared";

export class GcoresNode {

    constructor(private data: IArticle, private isGcoresElementNode: boolean = true, public linkData: string = "", public rssMp3Link: string = "") {}

    public get name(): string {
        return this.data.name;
    }

    public get type(): string {
        return this.data.type;
    }

    public get id(): string {
        return this.data.id;
    }

    public get authorId(): string {
        return this.data.authorId;
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

    public get bookmarkId(): string {
        return this.data.bookmarkId;
    }

    public get likeId(): string {
        return this.data.likeId;
    }

    public get createdAt(): string {
        return this.data.createdAt;
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
    public get link(): string {
        if (this.rssMp3Link) {
            return this.rssMp3Link;
        }
        if (this.linkData) {
            return audioBaseMp3Url + this.linkData;
        }
        return "";
    }
    public get previewCommand(): Command {
        return {
            title: "Preview Article",
            command: "gcores.previewArticle",
            arguments: [this],
        };
    }

    public get loginCommand(): Command {
        return {
            title: "Login",
            command: "gcores.login",
            arguments: [this],
        };
    }
}
