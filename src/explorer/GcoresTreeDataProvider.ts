import * as path from "path";
import * as vscode from "vscode";
import { getArticlesDataByAuthor, getArticlesDataByTag } from "../api";
import { articleTagsMapping, authorNamesMapping, Category, globalStateGcoresAuthorKey } from "../shared";
import { explorerNodeManager } from "./explorerNodeManager";
import { GcoresNode } from "./GcoresNode";

export class GcoresTreeDataProvider implements vscode.TreeDataProvider<GcoresNode> {

    private context!: vscode.ExtensionContext;

    private onDidChangeTreeDataEvent: vscode.EventEmitter<GcoresNode | undefined | null> = new vscode.EventEmitter<GcoresNode | undefined | null>();
    // tslint:disable-next-line:member-ordering
    public readonly onDidChangeTreeData: vscode.Event<any> = this.onDidChangeTreeDataEvent.event;

    public initialize(context: vscode.ExtensionContext): void {
        this.context = context;
    }

    public async refresh(): Promise<void> {
        this.onDidChangeTreeDataEvent.fire();
    }

    public getTreeItem(element: GcoresNode): vscode.TreeItem | Thenable<vscode.TreeItem> {

        let contextValue: string;
        const newAuthorsid: string[] = Object.values(this.newAuthors);
        contextValue = !element.isGcoresElement && newAuthorsid.includes(element.authorId) ? "can-delete" : "";

        return {
            label: element.isGcoresElement ? `${element.name}` : element.name,
            collapsibleState: element.isGcoresElement ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed,
            command: element.isGcoresElement ? element.previewCommand : undefined,
            iconPath: element.isHotElement ? this.context.asAbsolutePath(path.join("resources", "hot.png")) : "",
            contextValue,
        };
    }

    public getChildren(element?: GcoresNode | undefined): vscode.ProviderResult<GcoresNode[]> {
        if (!element) {
            return explorerNodeManager.getRootNodes();
        } else {
            switch (element.id) {
                case Category.Recent:
                    return explorerNodeManager.GetRecentArticlesNodes();
                case Category.News:
                    return explorerNodeManager.GetRecentNewsNodes();
                case Category.Tag:
                    return explorerNodeManager.GetTagsNodes();
                case Category.Author:
                    return explorerNodeManager.GetAuthorsNodes(this.nowAuthorNamesMapping);
                default:
                    break;
            }
            if (articleTagsMapping.has(element.id)) {
                return explorerNodeManager.getOneLabelArticlesNodes(element.id, getArticlesDataByTag.bind(null, articleTagsMapping));
            }
            if (this.nowAuthorNamesMapping.has(element.id)) {
                return explorerNodeManager.getOneLabelArticlesNodes(element.id, getArticlesDataByAuthor.bind(null, this.nowAuthorNamesMapping));
            }
        }
    }

    private get nowAuthorNamesMapping(): Map<string, string> {
        const newAuthors: object = this.newAuthors;
        if (!newAuthors) {
            return authorNamesMapping;
        }
        return new Map([...authorNamesMapping, ...Object.entries(newAuthors)]);
    }

    private get newAuthors(): object {
        return this.context.globalState.get(globalStateGcoresAuthorKey) || {};
    }
}

export const gcoresTreeDataProvider: GcoresTreeDataProvider = new GcoresTreeDataProvider();
