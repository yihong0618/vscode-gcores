import * as vscode from "vscode";
import { homedir } from "os";
import { addAuthor, deleteAuthor } from "./commands/author";
import { addBookmark, deleteBookmark } from "./commands/bookmark";
import { toggleBossKey } from "./commands/boss";
import { getLatestArticles } from "./commands/latest";
import { addLike, deleteLike } from "./commands/like";
import { pickArticle } from "./commands/pick";
import { getSearchArticles } from "./commands/search";
import { previewArticle } from "./commands/show";
import { playAudio } from "./commands/play";
import { userLogin, userLogout } from "./commands/user";
import { GcoresNode } from "./explorer/GcoresNode";
import { GCORES_DIR } from "./shared/shared"
import { gcoresTreeDataProvider } from "./explorer/GcoresTreeDataProvider";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    await vscode.workspace.fs.createDirectory(GCORES_DIR);
    gcoresTreeDataProvider.initialize(context);
    gcoresTreeDataProvider.refresh();
    await gcoresTreeDataProvider.isLogin();
    context.subscriptions.push(
        vscode.window.createTreeView("gcoresExplorer", { treeDataProvider: gcoresTreeDataProvider, showCollapseAll: true }),
        vscode.commands.registerCommand("gcores.refreshExplorer", () => gcoresTreeDataProvider.refresh()),
        vscode.commands.registerCommand("gcores.previewArticle", (node: GcoresNode) => previewArticle(context, node)),
        vscode.commands.registerCommand("gcores.pickOne", () => pickArticle(context)),
        vscode.commands.registerCommand("gcores.latestArticles", () => getLatestArticles(context)),
        vscode.commands.registerCommand("gcores.latestNews", () => getLatestArticles(context, true)),
        vscode.commands.registerCommand("gcores.searchArticles", () => getSearchArticles(context)),
        vscode.commands.registerCommand("gcores.login", () => userLogin(context)),
        vscode.commands.registerCommand("gcores.logout", () => userLogout(context)),
        vscode.commands.registerCommand("gcores.toggleBossKey", () => toggleBossKey(context)),
        vscode.commands.registerCommand("gcores.addAuthor", (data: string) => addAuthor(context, data)),
        vscode.commands.registerCommand("gcores.deleteAuthor", (input: GcoresNode) => deleteAuthor(context, input)),
        vscode.commands.registerCommand("gcores.addBookmark", (node: GcoresNode) => addBookmark(node)),
        vscode.commands.registerCommand("gcores.deleteBookmark", (node: GcoresNode) => deleteBookmark(node)),
        vscode.commands.registerCommand("gcores.addLike", (node: GcoresNode) => addLike(node)),
        vscode.commands.registerCommand("gcores.deleteLike", (node: GcoresNode) => deleteLike(node)),
        vscode.commands.registerCommand("gcores.playAudio", (node: GcoresNode) => playAudio(node)),
    );
}

// this method is called when your extension is deactivated
export function deactivate(): void {
    // Do Nothing.
}
