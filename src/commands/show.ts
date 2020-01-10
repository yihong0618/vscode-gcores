import * as vscode from "vscode";
import { WebviewPanel } from "vscode";
import { getOneArticleData } from "../api";
import { markdownEngine } from "../webview/markdownEngine";

const baseImgUrl: string = "https://image.gcores.com/";

const articleStyleMapping: Map<any, any> = new Map([
    ["unstyled", (toRenderText) => `${toRenderText}`],
    ["atomic", (toRenderText) => `![](${baseImgUrl}${toRenderText})`],
    ["header-one", (toRenderText) => `# ${toRenderText}`],
    ["unordered-list-item", (toRenderText) => `- ${toRenderText}`],
]);

function getWebviewContent(content: string): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Gcors Article</title>
        <style>
        .img {
            width:50px;
            height:50px;
         }
        </style>
    </head>
    <body>
        ${content}
    </body>
    </html>`;
}

function parseContent(dataBloks: any | undefined): string {
    let result: string = "";
    const dataArray: any = dataBloks.blocks;
    const entityMap: any = dataBloks.entityMap;
    let index: number = 0;
    dataArray.forEach(element => {
        const textFunc = articleStyleMapping.get(element.type);
        let toRenderText = textFunc(element.text);
        if (element.type === "atomic") {
            toRenderText = textFunc(entityMap[index].data.path);
            index++;
        }
        result += markdownEngine.render(toRenderText);
    });
    return result;
}

export async function previewArticle(node): Promise<void> {
    const articleData: any = await getOneArticleData(node.id);
    const articleContent: string = articleData.data.attributes.content;
    const dataBlocks: any | undefined = JSON.parse(articleContent);
    const bodyData = parseContent(dataBlocks);
    const panel: WebviewPanel | undefined = vscode.window.createWebviewPanel(node.name, node.name, vscode.ViewColumn.One, {});
    panel.webview.html = getWebviewContent(bodyData);
}
