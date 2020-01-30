import * as vscode from "vscode";
import { commands } from "vscode";
import { explorerNodeManager } from "../explorer/explorerNodeManager";
import { GcoresNode } from "../explorer/GcoresNode";
import { defaultArticle, IQuickItemEx } from "../shared/shared";
import { previewArticle } from "./show";

interface IWebViewMessage {
    command: {
        action: string,
        data: any,
    };
}

export async function onDidReceiveMessage(message: IWebViewMessage): Promise<void> {
    switch (message.command.action) {
        case "Add Author": {
            await commands.executeCommand("gcores.addAuthor",  message.command.data);
            break;
        }
        case "Add Bookmark": {
            const node: GcoresNode = new GcoresNode(Object.assign({}, defaultArticle, {
                id: message.command.data.nodeId,
                name: message.command.data.nodeName,
            }), true);
            await commands.executeCommand("gcores.addBookmark", node);
        }
        case "Add Like": {
            const node: GcoresNode = new GcoresNode(Object.assign({}, defaultArticle, {
                id: message.command.data.nodeId,
                name: message.command.data.nodeName,
            }), true);
            await commands.executeCommand("gcores.addLike", node);
        }
        // TODO add more action here
    }
}

export async function getPickedAndOpen(context: vscode.ExtensionContext, data: any): Promise<void> {
    const nodes: GcoresNode[] = [];
    const picks: Array<IQuickItemEx<string>> = [];
    for (const d of data.data) {
        const toPickNode: GcoresNode = explorerNodeManager.parseToGcoresNode(d);
        nodes.push(toPickNode);
        picks.push(
            {
                label: toPickNode.name,
                value: toPickNode.id,
            },
        );
    }
    const choice: IQuickItemEx<string> | undefined = await vscode.window.showQuickPick(picks);
    if (!choice) {
        return;
    }
    const value: string = choice.value;
    const pickedNode: GcoresNode = nodes.filter((v: GcoresNode) => v.id === value)[0];
    await previewArticle(context, pickedNode);
}
