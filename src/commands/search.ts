import * as vscode from "vscode";
import { getSearchInfo } from "../api";
import { getPickedAndOpen } from "./utils";

export async function getSearchArticles(context: vscode.ExtensionContext): Promise<void> {
    try {
        const searchString: any | undefined = await new Promise(async (resolve: (res: string | undefined) => void, reject: (e: Error) => void): Promise<void> => {

            const inputString: string | undefined = await vscode.window.showInputBox({
                prompt: "Enter your search string.",
                validateInput: (s: string): string | undefined => s && s.trim() ? undefined : "The input must not be empty",
            });
            if (!inputString) {
                return resolve(undefined);
            }
            resolve(inputString);
        });
        if (searchString) {
            const data: any = await getSearchInfo(searchString, 10);
            await getPickedAndOpen(context, data);
        }
    } catch (error) {
        vscode.window.showInformationMessage("Failed to search");
    }

}
