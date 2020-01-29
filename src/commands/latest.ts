import * as vscode from "vscode";
import { getRecentArticlesData, getRecentNewsData } from "../api";
import { explorerNodeManager } from "../explorer/explorerNodeManager";
import { GcoresNode } from "../explorer/GcoresNode";
import { baseQuickPicksNum, IQuickItemEx } from "../shared/shared";
import { previewArticle } from "./show";

export async function getLatestArticles(context: vscode.ExtensionContext, isNews: boolean = false): Promise<void> {

    const picks: Array<IQuickItemEx<string>> = [];
    // first five
    const apiFunc: any = isNews === false ? getRecentArticlesData : getRecentNewsData;
    const data: any = await apiFunc(baseQuickPicksNum);
    const nodes: GcoresNode[] = [];
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
