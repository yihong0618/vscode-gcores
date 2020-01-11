import * as vscode from "vscode";
import { previewArticle } from "./commands/show";
import { GcoresNode } from "./explorer/GcoresNode";
import { gcoresTreeDataProvider } from "./explorer/GcoresTreeDataProvider";

export function activate(context: vscode.ExtensionContext): void {

    const disposable: vscode.Disposable = vscode.commands.registerCommand("extension.helloWorld", () => {
        vscode.window.showInformationMessage("Hello World!");
    });
    gcoresTreeDataProvider.initialize(context);
    gcoresTreeDataProvider.refresh();
    context.subscriptions.push(
        disposable,
        vscode.window.createTreeView("gcoresExplorer", { treeDataProvider: gcoresTreeDataProvider, showCollapseAll: true }),
        vscode.commands.registerCommand("gcores.previewArticle", (node: GcoresNode) => previewArticle(node)),
    );
}

// this method is called when your extension is deactivated
export function deactivate(): void {
    // Do Nothing.
}
