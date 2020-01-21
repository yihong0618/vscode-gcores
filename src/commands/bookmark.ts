import * as vscode from "vscode";
import { addBookmarkById, deleteBookmarkArticle } from "../api";
import { GcoresNode } from "../explorer/GcoresNode";
import { gcoresTreeDataProvider } from "../explorer/GcoresTreeDataProvider";

export async function addBookmark(node: GcoresNode): Promise<void> {
    const userId: string = gcoresTreeDataProvider.userId;
    const token: string = gcoresTreeDataProvider.token;
    const isOK: boolean = await addBookmarkById(userId, node.id, token);
    if (!isOK) {
        vscode.window.showInformationMessage(`faild to add bookmark for ${node.name}`);
        return;
    }
    vscode.window.showInformationMessage(`Successfully add bookmark for ${node.name}.`);
    // add this node to bookmarked node
    gcoresTreeDataProvider.userBookmarks.push(node.id);
    gcoresTreeDataProvider.refresh();
}

export async function deleteBookmark(node: GcoresNode): Promise<void> {
    const token: string = gcoresTreeDataProvider.token;
    const isOK: boolean = await deleteBookmarkArticle(node.bookmarkId, token);
    if (!isOK) {
        vscode.window.showInformationMessage(`faild to delete bookmark for ${node.name}`);
        return;
    }
    vscode.window.showInformationMessage(`Successfully delete bookmark for ${node.name}.`);
    gcoresTreeDataProvider.refresh();
}
