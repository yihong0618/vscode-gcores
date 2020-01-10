import * as vscode from "vscode";
import { articleTagsMapping, Category, authorNamesMapping } from "../shared";
import { explorerNodeManager } from "./explorerNodeManager";
import { GcoresNode } from "./GcoresNode";

export class GcoresTreeDataProvider implements vscode.TreeDataProvider<GcoresNode> {

    private context: vscode.ExtensionContext;

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

        return {
            label: element.isGcoresElement ? `${element.name}` : element.name,
            collapsibleState: element.isGcoresElement ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed,
            command: element.isGcoresElement ? element.previewCommand : undefined,
            contextValue: element.id,
        };
    }

    public async getChildren(element?: GcoresNode | undefined): vscode.ProviderResult<GcoresNode[]> {
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
                    return explorerNodeManager.GetAuthorsNodes()
                default:
                    break;
            }
            if (articleTagsMapping.has(element.id)) {
                return explorerNodeManager.getOneTagArticlesNodes(element.id);
            }
            if (authorNamesMapping.has(element.id)) {
                return explorerNodeManager.getOneAuthorArticlesNodes(element.id);
            }
        }
    }

}

export const gcoresTreeDataProvider: GcoresTreeDataProvider = new GcoresTreeDataProvider();
