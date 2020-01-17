import * as vscode from "vscode";
import { getAuthorInfo, login } from "../api";
import { gcoresTreeDataProvider } from "../explorer/GcoresTreeDataProvider";
import { globalStateGcoresUserKey } from "../shared";

export async function userLogin(context: vscode.ExtensionContext): Promise<void> {
    try {
        const loginData: any | undefined = await new Promise(async (resolve: (res: string | undefined) => void, reject: (e: Error) => void): Promise<void> => {

            const name: string | undefined = await vscode.window.showInputBox({
                prompt: "Enter gcores user name.",
                validateInput: (s: string): string | undefined => s && s.trim() ? undefined : "The input must not be empty",
            });
            if (!name) {
                return resolve(undefined);
            }
            const pwd: string | undefined = await vscode.window.showInputBox({
                prompt: "Enter password.",
                password: true,
                validateInput: (s: string): string | undefined => s ? undefined : "Password must not be empty",
            });
            if (!pwd) {
                return resolve(undefined);
            }
            const loginCBData: any = await login(name, pwd);
            resolve(loginCBData.data);
        });
        if (loginData) {
            const userId: string = loginData["user-id"];
            const userData: any = await getAuthorInfo(userId);
            let user: any = context.globalState.get(globalStateGcoresUserKey);
            if (!user) {
                user = {};
            }
            const userName: string = userData.data.attributes.nickname;
            user.tokenData = {};
            user.tokenData.userId =  userId;
            user.tokenData.userName = userName;
            user.tokenData.token = loginData["token"];
            await context.globalState.update(globalStateGcoresUserKey, user);
            vscode.window.showInformationMessage(`Successfully add author ${userName}.`);
            gcoresTreeDataProvider.refresh();
        }
    } catch (error) {
        vscode.window.showInformationMessage("Failed to login");
    }
}
