import * as vscode from "vscode";
import { gcoresTreeDataProvider } from "./explorer/GcoresTreeDataProvider";
import { previewArticle } from "./commands/show"


export function activate(context: vscode.ExtensionContext): void {

    const disposable: vscode.Disposable = vscode.commands.registerCommand("extension.helloWorld", () => {
        vscode.window.showInformationMessage("Hello World!");
    });
    gcoresTreeDataProvider.initialize(context);
    gcoresTreeDataProvider.refresh();
    context.subscriptions.push(
        disposable,
        vscode.window.createTreeView("gcoresExplorer", { treeDataProvider: gcoresTreeDataProvider, showCollapseAll: true }),
        vscode.commands.registerCommand("gcores.previewArticle", (node) => previewArticle(node)),
    );
}

// this method is called when your extension is deactivated
export function deactivate(): void {
    // Do Nothing.
}
