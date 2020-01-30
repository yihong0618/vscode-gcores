import * as vscode from "vscode";
import { addLikeById } from "../api";
import { GcoresNode } from "../explorer/GcoresNode";
import { gcoresTreeDataProvider } from "../explorer/GcoresTreeDataProvider";

export async function addLike(node: GcoresNode): Promise<void> {
    const userId: string = gcoresTreeDataProvider.userId;
    const token: string = gcoresTreeDataProvider.token;
    const isOK: boolean = await addLikeById(userId, node.id, token);
    if (!isOK) {
        vscode.window.showInformationMessage(`faild to add like for ${node.name}`);
        return;
    }
    vscode.window.showInformationMessage(`Successfully add like for ${node.name}.`);
    gcoresTreeDataProvider.refresh();
}
