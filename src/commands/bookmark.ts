import * as vscode from "vscode";
import { addBookmarkById } from "../api";
import { GcoresNode } from "../explorer/GcoresNode";
import { gcoresTreeDataProvider } from "../explorer/GcoresTreeDataProvider";

export async function addbookmark(node: GcoresNode): Promise<void> {
    const userId: string = gcoresTreeDataProvider.userId;
    const token: string = gcoresTreeDataProvider.token;
    const isOK: boolean = await addBookmarkById(userId, node.id, token);
    if (!isOK) {
        vscode.window.showInformationMessage(`faild to add bookmark for ${node.name}`);
        return;
    }
    vscode.window.showInformationMessage(`Successfully add bookmark for ${node.name}.`);
    gcoresTreeDataProvider.refresh();
}
