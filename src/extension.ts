import * as vscode from "vscode";
import { addAuthor, deleteAuthor } from "./commands/author";
import { pickArticle } from "./commands/pick";
import { previewArticle } from "./commands/show";
import { GcoresNode } from "./explorer/GcoresNode";
import { gcoresTreeDataProvider } from "./explorer/GcoresTreeDataProvider";

export async function activate(context: vscode.ExtensionContext): Promise<void> {

    const disposable: vscode.Disposable = vscode.commands.registerCommand("extension.helloWorld", () => {
        vscode.window.showInformationMessage("Hello World!");
    });
    gcoresTreeDataProvider.initialize(context);
    gcoresTreeDataProvider.refresh();
    context.subscriptions.push(
        disposable,
        vscode.window.createTreeView("gcoresExplorer", { treeDataProvider: gcoresTreeDataProvider, showCollapseAll: true }),
        vscode.commands.registerCommand("gcores.refreshExplorer", () => gcoresTreeDataProvider.refresh()),
        vscode.commands.registerCommand("gcores.previewArticle", (node: GcoresNode) => previewArticle(node)),
        vscode.commands.registerCommand("gcores.pickOne", () => pickArticle()),
        vscode.commands.registerCommand("gcores.addAuthor", () => addAuthor(context)),
        vscode.commands.registerCommand("gcores.deleteAuthor", (input: any) => deleteAuthor(context, input)),
    );
}

// this method is called when your extension is deactivated
export function deactivate(): void {
    // Do Nothing.
}
