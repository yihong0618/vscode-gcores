import * as vscode from "vscode";
import { addLikeById, deleteLikeArticle } from "../api";
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

export async function deleteLike(node: GcoresNode): Promise<void> {
    const token: string = gcoresTreeDataProvider.token;
    const isOK: boolean = await deleteLikeArticle(node.likeId, token);
    if (!isOK) {
        vscode.window.showInformationMessage(`faild to delete like for ${node.name}`);
        return;
    }
    vscode.window.showInformationMessage(`Successfully delete like for ${node.name}.`);
}
