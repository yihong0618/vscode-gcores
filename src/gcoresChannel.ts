// TODO Some code from vscode-leetcode for future use.
// Licensed under the MIT license.

import * as vscode from "vscode";

class GcoresChannel implements vscode.Disposable {
    private readonly channel: vscode.OutputChannel = vscode.window.createOutputChannel("Gcores");

    public appendLine(message: string): void {
        this.channel.appendLine(message);
    }

    public append(message: string): void {
        this.channel.append(message);
    }

    public show(): void {
        this.channel.show();
    }

    public dispose(): void {
        this.channel.dispose();
    }
}

export const gcoresChannel: GcoresChannel = new GcoresChannel();
