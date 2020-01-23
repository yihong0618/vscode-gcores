
import * as vscode from "vscode";
import { gcoresTreeDataProvider } from "../explorer/GcoresTreeDataProvider";
import { globalStateGcoresBossKey } from "../shared/shared";

export async function toggleBossKey(context: vscode.ExtensionContext): Promise<void> {
    const bossInfo: any = context.globalState.get(globalStateGcoresBossKey);
    // first time to set isBoss true
    if (!bossInfo) {
        await context.globalState.update(globalStateGcoresBossKey, {isBoss: true});
        vscode.window.showInformationMessage("Successfully toggle boss key");
        gcoresTreeDataProvider.refresh();
        return;
    }
    let isBoss: any = bossInfo.isBoss;
    isBoss = !isBoss;
    await context.globalState.update(globalStateGcoresBossKey, {isBoss});
    vscode.window.showInformationMessage("Successfully toggle boss key");
    gcoresTreeDataProvider.refresh();
    return;
}
