import { commands, ExtensionContext } from "vscode";

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
