import { commands, ExtensionContext } from "vscode";
import * as vscode from "vscode";
import { getRecentArticlesData, getRecentNewsData } from "../api";
import { explorerNodeManager } from "../explorer/explorerNodeManager";
import { GcoresNode } from "../explorer/GcoresNode";
import { baseQuickPicksNum, IQuickItemEx } from "../shared/shared";
import { previewArticle } from "./show";

interface IWebViewMessage {
    command: {
        action: string,
        data: string,
    };
}

export async function onDidReceiveMessage(message: IWebViewMessage): Promise<void> {
    switch (message.command.action) {
        case "Add Author": {
            await commands.executeCommand("gcores.addAuthor",  message.command.data);
            break;
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
