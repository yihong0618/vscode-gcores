import * as vscode from "vscode";
import { getAuthorInfo } from "../api";
import { globalStateGcoresAuthorKey } from "../shared";

export async function addAuthor(context: vscode.ExtensionContext): Promise<void> {
    try {
        const authorId: string | undefined = await new Promise(async (resolve: (res: string | undefined) => void, reject: (e: Error) => void): Promise<void> => {

            const name: string | undefined = await vscode.window.showInputBox({
                prompt: "Enter gcores author url or author id.",
                validateInput: (s: string): string | undefined => s && s.trim() ? undefined : "The input must not be empty",
            });
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
            let authors = context.globalState.get(globalStateGcoresAuthorKey);
            if (!authors) {
                authors = {};
            }
            const authorName: string = authorData.data.attributes.nickname;
            authors[authorName] = authorId;
            await context.globalState.update(globalStateGcoresAuthorKey, authors);
            vscode.window.showInformationMessage(`Successfully add author.`);
        }
    } catch (error) {
        vscode.window.showInformationMessage(`Failed to add author. Please open the output channel for details`);
    }
}
