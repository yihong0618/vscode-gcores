import * as path from "path";
import * as vscode from "vscode";
import { checkTokenWithApi, getArticlesDataByAuthor, getArticlesDataByHot, getArticlesDataByTag } from "../api";
import { articleTagsMapping, authorNamesMapping, Category, defaultArticle, globalStateGcoresAuthorKey, globalStateGcoresUserKey, globalStateRssKey, NATIVE, rssNamesMapping, topNamesMapping } from "../shared/shared";
import { explorerNodeManager } from "./explorerNodeManager";
import { GcoresNode } from "./GcoresNode";

export class GcoresTreeDataProvider implements vscode.TreeDataProvider<GcoresNode> {

    // TODO refactor these
    public userId!: string;
    public token!: string;
    public isIn!: boolean;
    public newAuthors!: any;
    public newRsses!: any;

    // audio relate
    public playingId: string = "";
    public player: any = NATIVE.playerNew();
    public isPlaying: boolean = false;

    // private
    private context!: vscode.ExtensionContext;
    private nowAuthorNamesMapping!: Map<string, string>;
    private nowRssNamesMapping!: Map<string, string>;

    private onDidChangeTreeDataEvent: vscode.EventEmitter<GcoresNode | undefined | null> = new vscode.EventEmitter<GcoresNode | undefined | null>();
    // tslint:disable-next-line:member-ordering
    public readonly onDidChangeTreeData: vscode.Event<any> = this.onDidChangeTreeDataEvent.event;

    public initialize(context: vscode.ExtensionContext): void {
        this.context = context;
        this.isIn = false;
        this.userId = "";
        this.token = "";
        this.nowAuthorNamesMapping = new Map();
        this.nowRssNamesMapping = new Map();
        this.newAuthors = {};
        this.newRsses = {};
    }

    public async refresh(): Promise<void> {
        this.nowAuthorNamesMapping = this.getNowAuthorNamesMapping();
        this.nowRssNamesMapping = this.getNowRssNamesMapping();
        this.newAuthors = this.getNewAuthors();
        this.newRsses = this.getNewRss();
        // when refresh the offsetmapping must clear;
        explorerNodeManager.offsetMapping.clear();
        this.onDidChangeTreeDataEvent.fire(null);
    }

    public getTreeItem(element: GcoresNode): vscode.TreeItem | Thenable<vscode.TreeItem> {

        let contextValue: string = "";
        const newAuthorsId: string[] = Object.values(this.newAuthors);
        const newRssId: string[] = Object.values(this.newRsses);
        if (element.isGcoresElement && this.isIn) {
            if (element.bookmarkId === "") {
                contextValue = "can-bookmark";
            } else {
                contextValue = "can-delete-bookmark";
            }
        }
        if (element.isGcoresElement && element.type === "radios") {
            if (element.id === gcoresTreeDataProvider.playingId) {
                contextValue = "can-stop";
            } else {
                contextValue = "can-play";
            }
        }
        if (!element.isGcoresElement && newAuthorsId.includes(element.authorId)) {
            contextValue = "can-delete-author";
        }
        // for rss quick delete
        if (!element.isGcoresElement && newRssId.includes(element.authorId)) {
            contextValue = "can-delete-rss";
        }
        // if more command this way make it to a map
        let command: vscode.Command | undefined;
        if (element.id === "not login") {
            command = element.loginCommand;
        } else if (element.id === "add rss") {
            command = element.addRssCommand;
        } else {
            command = undefined;
        }
        return {
            label: element.isGcoresElement ? `${element.name}` : element.name,
            collapsibleState: element.isGcoresElement ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed,
            command: element.isGcoresElement ? element.previewCommand : command,
            iconPath: element.isHotElement ? this.context.asAbsolutePath(path.join("resources", "hot.png")) : "",
            contextValue,
        };
    }

    public async getChildren(element?: GcoresNode | undefined): Promise<any> {
        if (!element) {
            return explorerNodeManager.getRootNodes();
        } else {
            switch (element.id) {
                case Category.Recent:
                    return explorerNodeManager.GetRecentArticlesNodes(element.id, this.token);
                case Category.News:
                    return explorerNodeManager.GetRecentNewsNodes(element.id, this.token);
                case Category.Tag:
                    return explorerNodeManager.GetTagsNodes();
                case Category.Author:
                    return explorerNodeManager.GetAuthorsNodes(this.nowAuthorNamesMapping);
                case Category.Top:
                    return explorerNodeManager.GetTopsNodes();
                case Category.Bookmark:
                    if (!this.isIn) {
                        return [
                            new GcoresNode(Object.assign({}, defaultArticle, {
                                id: "not login",
                                name: "Please login gcores",
                            }), false),
                        ];
                    }
                    return explorerNodeManager.getBookmarkArticlesNodes(element.id, this.userId, this.token);
                case Category.Audios:
                    return explorerNodeManager.GetRecentAudiosNodes(element.id, this.userId);
                case Category.Rss:
                    return explorerNodeManager.GetRssNodes(this.nowRssNamesMapping);
                default:
                    break;
            }
            if (articleTagsMapping.has(element.id)) {
                return explorerNodeManager.getOneLabelArticlesNodes(element.id, getArticlesDataByTag.bind(null, articleTagsMapping));
            }
            if (topNamesMapping.has(element.id)) {
                return explorerNodeManager.getOneLabelArticlesNodes(element.id, getArticlesDataByHot.bind(null, topNamesMapping));
            }
            if (this.nowAuthorNamesMapping.has(element.id)) {
                return explorerNodeManager.getOneLabelArticlesNodes(element.id, getArticlesDataByAuthor.bind(null, this.nowAuthorNamesMapping));
            }
            if (this.nowRssNamesMapping.has(element.id)) {
                // rss use authId for the url for now
                return explorerNodeManager.getOneLabelRssNodes(element.authorId);
            }
        }
    }

    public async isLogin(): Promise<void> {
        const user: any = await this.context.globalState.get(globalStateGcoresUserKey);
        // empty object
        if (user === undefined || Object.entries(user).length === 0 && user.constructor === Object) {
            this.isIn = false;
            return;
        }
        const isChecked: boolean = await this.checkToken(user.tokenData);
        this.isIn = user && isChecked;
        if (this.isIn) {
            this.userId = user.tokenData.userId;
            this.token = user.tokenData.token;
        }
    }

    private async checkToken(tokenData: any): Promise<boolean> {
        const userId: string = tokenData.userId;
        const token: string = tokenData.token;
        const isOK: boolean = await checkTokenWithApi(userId, token);
        return isOK;
    }

    private getNowAuthorNamesMapping(): Map<string, string> {
        const newAuthors: object = this.getNewAuthors();
        // empty object
        if (newAuthors === undefined || Object.entries(newAuthors).length === 0 && newAuthors.constructor === Object) {
            return authorNamesMapping;
        }
        return new Map([...authorNamesMapping, ...Object.entries(newAuthors)]);
    }

    private getNewAuthors(): any {
        return this.context.globalState.get(globalStateGcoresAuthorKey) || {};
    }

    private getNewRss(): any {
        return this.context.globalState.get(globalStateRssKey) || {};
    }

    private getNowRssNamesMapping(): Map<string, string> {
        const newRss: object = this.getNewRss();
        // empty object
        if (newRss === undefined || Object.entries(newRss).length === 0 && newRss.constructor === Object) {
            return rssNamesMapping;
        }
        return new Map([...rssNamesMapping, ...Object.entries(newRss)]);
    }
}

export const gcoresTreeDataProvider: GcoresTreeDataProvider = new GcoresTreeDataProvider();
