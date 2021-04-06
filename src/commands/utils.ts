import { Readable } from "stream";
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
        case "Delete Author": {
            await commands.executeCommand("gcores.deleteAuthor",  message.command.data);
            break;
        }
        case "Add Bookmark": {
            const node: GcoresNode = new GcoresNode(Object.assign({}, defaultArticle, {
                id: message.command.data.nodeId,
                name: message.command.data.nodeName,
            }), true);
            await commands.executeCommand("gcores.addBookmark", node);
            break;
        }
        case "Delete Bookmark": {
            const node: GcoresNode = new GcoresNode(Object.assign({}, defaultArticle, {
                id: message.command.data.nodeId,
                name: message.command.data.nodeName,
                bookmarkId: message.command.data.bookmarkId,
            }), true);
            await commands.executeCommand("gcores.deleteBookmark", node);
            break;
        }
        case "Add Like": {
            const node: GcoresNode = new GcoresNode(Object.assign({}, defaultArticle, {
                id: message.command.data.nodeId,
                name: message.command.data.nodeName,
            }), true);
            await commands.executeCommand("gcores.addLike", node);
            break;
        }
        case "Delete Like": {
            const node: GcoresNode = new GcoresNode(Object.assign({}, defaultArticle, {
                id: message.command.data.nodeId,
                name: message.command.data.nodeName,
                likeId: message.command.data.likeId,
            }), true);
            await commands.executeCommand("gcores.deleteLike", node);
            break;
        }
        // TODO add more action here
    }
}

export async function getPickedAndOpen(context: vscode.ExtensionContext, data: any): Promise<void> {
    const nodes: GcoresNode[] = [];
    const picks: Array<IQuickItemEx<string>> = [];
    for (const d of data.data) {
        const toPickNode: GcoresNode = await explorerNodeManager.parseToGcoresNode(d);
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

export function parseMp3Link(data: any): string {
    const included: any = data.included;
    for (const i of included) {
        if (i.type === "medias") {
            return i.attributes.audio;
        }
    }
    return "";
}
