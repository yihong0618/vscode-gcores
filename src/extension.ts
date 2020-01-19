import * as vscode from "vscode";
import { addAuthor, deleteAuthor } from "./commands/author";
import { pickArticle } from "./commands/pick";
import { previewArticle } from "./commands/show";
import { userLogin, userLogout } from "./commands/user";
import { GcoresNode } from "./explorer/GcoresNode";
import { gcoresTreeDataProvider } from "./explorer/GcoresTreeDataProvider";

export async function activate(context: vscode.ExtensionContext): Promise<void> {

    gcoresTreeDataProvider.initialize(context);
    gcoresTreeDataProvider.refresh();
    context.subscriptions.push(
        vscode.window.createTreeView("gcoresExplorer", { treeDataProvider: gcoresTreeDataProvider, showCollapseAll: true }),
        vscode.commands.registerCommand("gcores.refreshExplorer", () => gcoresTreeDataProvider.refresh()),
        vscode.commands.registerCommand("gcores.previewArticle", (node: GcoresNode) => previewArticle(node)),
        vscode.commands.registerCommand("gcores.pickOne", () => pickArticle()),
        vscode.commands.registerCommand("gcores.login", () => userLogin(context)),
        vscode.commands.registerCommand("gcores.logout", () => userLogout(context)),
        vscode.commands.registerCommand("gcores.addAuthor", (data: string) => addAuthor(context, data)),
        vscode.commands.registerCommand("gcores.deleteAuthor", (input: GcoresNode) => deleteAuthor(context, input)),
    );
}

// this method is called when your extension is deactivated
export function deactivate(): void {
    // Do Nothing.
}
