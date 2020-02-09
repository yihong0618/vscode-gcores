import * as path from "path";
import * as vscode from "vscode";
import { checkTokenWithApi, getArticlesDataByAuthor, getArticlesDataByTag } from "../api";
import { articleTagsMapping, authorNamesMapping, Category, defaultArticle, globalStateGcoresAuthorKey, globalStateGcoresUserKey, topNamesMapping } from "../shared/shared";
import { explorerNodeManager } from "./explorerNodeManager";
import { GcoresNode } from "./GcoresNode";

export class GcoresTreeDataProvider implements vscode.TreeDataProvider<GcoresNode> {

    // TODO refactor these
    public userId!: string;
    public token!: string;
    public isIn!: boolean;
    public newAuthors!: any;

    // private
    private context!: vscode.ExtensionContext;
    private nowAuthorNamesMapping!: Map<string, string>;

    private onDidChangeTreeDataEvent: vscode.EventEmitter<GcoresNode | undefined | null> = new vscode.EventEmitter<GcoresNode | undefined | null>();
    // tslint:disable-next-line:member-ordering
    public readonly onDidChangeTreeData: vscode.Event<any> = this.onDidChangeTreeDataEvent.event;

    public initialize(context: vscode.ExtensionContext): void {
        this.context = context;
        this.isIn = false;
        this.userId = "";
        this.token = "";
        this.nowAuthorNamesMapping = new Map();
        this.newAuthors = {};
    }

    public async refresh(): Promise<void> {
        this.nowAuthorNamesMapping = this.getNowAuthorNamesMapping();
        this.newAuthors = this.getNewAuthors();
        // when refresh the offsetmapping must clear;
        explorerNodeManager.offsetMapping.clear();
        this.onDidChangeTreeDataEvent.fire();
    }

    public getTreeItem(element: GcoresNode): vscode.TreeItem | Thenable<vscode.TreeItem> {

        let contextValue: string = "";
        const newAuthorsid: string[] = Object.values(this.newAuthors);
        if (element.isGcoresElement && this.isIn) {
            if (element.bookmarkId === "") {
                contextValue = "can-bookmark";
            } else {
                contextValue = "can-delete-bookmark";
            }
        }
        if (!element.isGcoresElement && newAuthorsid.includes(element.authorId)) {
            contextValue = "can-delete";
        }
        return {
            label: element.isGcoresElement ? `${element.name}` : element.name,
            collapsibleState: element.isGcoresElement ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed,
            command: element.isGcoresElement ? element.previewCommand : element.id === "not login" ? element.loginCommand : undefined,
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
                default:
                    break;
            }
            if (articleTagsMapping.has(element.id)) {
                return explorerNodeManager.getOneLabelArticlesNodes(element.id, getArticlesDataByTag.bind(null, articleTagsMapping));
            }
            if (this.nowAuthorNamesMapping.has(element.id)) {
                return explorerNodeManager.getOneLabelArticlesNodes(element.id, getArticlesDataByAuthor.bind(null, this.nowAuthorNamesMapping));
            }
            if (topNamesMapping.has(element.id)) {
                return explorerNodeManager.parseGcoresNodeFromJson(topNamesMapping.get(element.id));
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

}

export const gcoresTreeDataProvider: GcoresTreeDataProvider = new GcoresTreeDataProvider();
