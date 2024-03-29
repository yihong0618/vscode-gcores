import * as vscode from "vscode";
import { getAuthorInfo } from "../api";
import { gcoresTreeDataProvider } from "../explorer/GcoresTreeDataProvider";
import { globalStateGcoresAuthorKey } from "../shared/shared";

export async function addAuthor(context: vscode.ExtensionContext, input: any): Promise<void> {
    try {
        const authorId: string | undefined = await new Promise(async (resolve: (res: string | undefined) => void, reject: (e: Error) => void): Promise<void> => {
            let name: string | undefined;
            if (!input) {
                name = await vscode.window.showInputBox({
                    prompt: "Enter gcores author url or author id.",
                    validateInput: (s: string): string | undefined => s && s.trim() ? undefined : "The input must not be empty",
                });
            } else {
                name = input;
            }
            if (!name) {
                return resolve(undefined);
            }
            const match: RegExpMatchArray | null = name.match(/\d+/g);
            if (match && match[0]) {
                resolve(match[0]);
            } else {
                reject(new Error("Please enter the right auhtor id or url"));
            }
        });
        if (authorId) {
            const authorData: any = await getAuthorInfo(authorId);
            let authors: any = context.globalState.get(globalStateGcoresAuthorKey);
            if (!authors) {
                authors = {};
            }
            const authorName: string = authorData.data.attributes.nickname;
            authors[authorName] = authorId;
            await context.globalState.update(globalStateGcoresAuthorKey, authors);
            vscode.window.showInformationMessage(`Successfully add author ${authorName}.`);
            gcoresTreeDataProvider.refresh();
        }
    } catch (error) {
        vscode.window.showInformationMessage(`Failed to add author. Please open the output channel for details`);
    }
}

export async function deleteAuthor(context: vscode.ExtensionContext, input: any): Promise<void> {
    try {
        const authorName: string | undefined = await new Promise(async (resolve: (res: string | undefined) => void, reject: (e: Error) => void): Promise<void> => {
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
                prompt: "Enter gcores author name from the category.",
                validateInput: (s: string): string | undefined => s && s.trim() ? undefined : "The input must not be empty",
            });
            if (!name) {
                return resolve(undefined);
            }
            return resolve(name);
        });
        if (authorName) {
            const authors: any = context.globalState.get(globalStateGcoresAuthorKey);
            if (authors && authors[authorName]) {
                delete authors[authorName];
            }
            await context.globalState.update(globalStateGcoresAuthorKey, authors);
            vscode.window.showInformationMessage(`Successfully delete author ${authorName}.`);
            gcoresTreeDataProvider.refresh();
        }
    } catch (error) {
        vscode.window.showInformationMessage(error.message);
    }
}
