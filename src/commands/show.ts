import * as vscode from "vscode";
import { WebviewPanel } from "vscode";
import { getOneArticleData } from "../api";

function getWebviewContent(content): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>1212</title>
        <style>
        </style>
    </head>
    <body>
        ${content}
    </body>
    </html>`;
}

function parseContent(content: string): string {
    return "232"
}

export async function previewArticle(node): Promise<void> {
    const articleData: any = await getOneArticleData(node.id);
    const panel: WebviewPanel | undefined = vscode.window.createWebviewPanel(node.name, node.name, vscode.ViewColumn.One, {});
    // console.log(eval(articleData.data.attributes.content));
    panel.webview.html = getWebviewContent(articleData.data.attributes.content);
}