import * as vscode from "vscode";
import { GcoresNode } from "./GcoresNode";
import { getGcoresData } from "../api"

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
            label: element.name,
            tooltip: "99999999",
            // description: "abcaaa",
            // collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            // iconPath: "",
            command: undefined,
            // contextValue: "see",
        };
    }

    public async getChildren(element?: GcoresNode | undefined): vscode.ProviderResult<GcoresNode[]> {
        let data = await getGcoresData()
        let nodes = [];
        for (let d of data.data) {
            nodes.push(new GcoresNode(d.attributes.title), true)
        }
        return nodes;
    }
}

export const gcoresTreeDataProvider: GcoresTreeDataProvider = new GcoresTreeDataProvider();
