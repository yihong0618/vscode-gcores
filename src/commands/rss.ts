import * as vscode from "vscode";
import { getRssData } from "../api";
import { gcoresTreeDataProvider } from "../explorer/GcoresTreeDataProvider";
import { globalStateRssKey } from "../shared/shared";

export async function addRss(context: vscode.ExtensionContext): Promise<void> {
    try {
        const rssUrl: string | undefined = await new Promise(async (resolve: (res: string | undefined) => void, reject: (e: Error) => void): Promise<void> => {
            let name: string | undefined;
            name = await vscode.window.showInputBox({
                prompt: "Please enter rss url",
                validateInput: (s: string): string | undefined => s && s.trim() ? undefined : "The input must not be empty",
            });
            if (!name) {
                return resolve(undefined);
            } else {
                return resolve(name);
            }
        });
        if (rssUrl) {
            const rssData: any = await getRssData(rssUrl);
            let rsses: any = context.globalState.get(globalStateRssKey);
            if (!rsses) {
                rsses = {};
            }
            if (!rssData.title) {
                vscode.window.showInformationMessage("There is no tilte for this rss url please check the url");
                return;
            }
            const rssTitleName: string = rssData.title;
            rsses[rssTitleName] = rssUrl;
            await context.globalState.update(globalStateRssKey, rsses);
            vscode.window.showInformationMessage(`Successfully add rss for ${rssTitleName}.`);
            gcoresTreeDataProvider.refresh();
        }
    } catch (error: any) {
        vscode.window.showInformationMessage(error.message);
    }
}

export async function deleteRss(context: vscode.ExtensionContext, input: any): Promise<void> {
    try {
        const rssName: string | undefined = await new Promise(async (resolve: (res: string | undefined) => void, reject: (e: Error) => void): Promise<void> => {
            // TODO input from webview or side bar logic are differnet maybe have a better way
            if (input) {
                if (typeof input === "string") {
                    const match: RegExpMatchArray | null = input.match(/>(.*)</);
                    if (match && match[0]) {
                        return resolve(match[1]);
                    } else {
                        return reject(new Error("Something wrong to delete the author"));
                    }
                }
                return resolve(input.data.name);
            }
            const name: string | undefined = await vscode.window.showInputBox({
                prompt: "Enter rss name from the category.",
                validateInput: (s: string): string | undefined => s && s.trim() ? undefined : "The input must not be empty",
            });
            if (!name) {
                return resolve(undefined);
            }
            return resolve(name);
        });
        if (rssName) {
            const authors: any = context.globalState.get(rssName);
            if (authors && authors[rssName]) {
                delete authors[rssName];
            }
            await context.globalState.update(globalStateRssKey, authors);
            vscode.window.showInformationMessage(`Successfully delete rss ${rssName}.`);
            gcoresTreeDataProvider.refresh();
        }
    } catch (error: any) {
        vscode.window.showInformationMessage(error.message);
    }
}
