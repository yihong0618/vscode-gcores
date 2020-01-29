import * as vscode from "vscode";
import { getRecentArticlesData, getRecentNewsData } from "../api";
import { baseQuickPicksNum } from "../shared/shared";
import { getPickedAndOpen } from "./utils";

export async function getLatestArticles(context: vscode.ExtensionContext, isNews: boolean = false): Promise<void> {

    // first five
    const apiFunc: any = isNews === false ? getRecentArticlesData : getRecentNewsData;
    const data: any = await apiFunc(baseQuickPicksNum);
    await getPickedAndOpen(context, data);
}
