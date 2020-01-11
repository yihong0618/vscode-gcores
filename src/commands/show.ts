import * as vscode from "vscode";
import { WebviewPanel } from "vscode";
import { getOneArticleData } from "../api";
import { GcoresNode } from "../explorer/GcoresNode";
import { baseArticleUrl, baseImgUrl } from "../shared";
import { markdownEngine } from "../webview/markdownEngine";

const articleStyleMapping: Map<any, any> = new Map([
    // Logic is wrong!!!
    ["unstyled", (toRenderText: string): string => `${toRenderText}`],
    ["atomic", (toRenderText: string): string => `![](${baseImgUrl}${toRenderText})`],
    ["header-one", (toRenderText: string): string => `# ${toRenderText}`],
    ["header-two", (toRenderText: string): string => `## ${toRenderText}`],
    ["header-three", (toRenderText: string): string => `### ${toRenderText}`],
    ["unordered-list-item", (toRenderText: string): string => `- ${toRenderText}`],
    // ToDo this is a skip need to refactor
    ["ordered-list-item", (toRenderText: string): string => `- ${toRenderText}`],
    ["blockquote", (toRenderText: string): string => `> ${toRenderText}`],
]);

function getWebviewContent(head: string, info: string, content: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https:; script-src vscode-resource: 'unsafe-inline'; style-src vscode-resource: 'unsafe-inline';"/>
        ${markdownEngine.getStyles()}
        <title>Gcors Article</title>
        <style>
        .img {
            width:50px;
            height:50px;
         }
        </style>
    </head>
    <body>
        ${head}
        ${content}
        <hr />
        ${info}
    </body>
    </html>
    `;
}

function parseContent(dataBloks: any | undefined): string {
    let result: string = "";
    const dataArray: any = dataBloks.blocks;
    const entityMap: any = dataBloks.entityMap;
    let index: number = 0;
    dataArray.forEach((element: any): void => {
        // const textFunc = articleStyleMapping.get(element.type);
        let textFunc: any = articleStyleMapping.get(element.type);
        if (!textFunc) {
            textFunc = (text: string): string => `{$text}`;
        }
        let toRenderText: string = textFunc(element.text);
        // Wrong Logic need to change 2020.01.11
        if (element.type === "atomic") {
            toRenderText = textFunc(entityMap[index].data.path);
            index++;
        }
        result += markdownEngine.render(toRenderText);
    });
    return result;
}

export async function previewArticle(node: GcoresNode): Promise<void> {
    const articleData: any = await getOneArticleData(node.id);
    const articleContent: string = articleData.data.attributes.content;
    const dataBlocks: any | undefined = JSON.parse(articleContent);
    const bodyData: any = parseContent(dataBlocks);
    const head: string = markdownEngine.render(`# [${node.name}](${baseArticleUrl}${node.id})`);
    const info: string = markdownEngine.render([
        `| Likes | Comments | Bookmarks |`,
        `| :---: | :------: | :-------: |`,
        `| ${node.likes} | ${node.comments} | ${node.bookmarks} |`,
    ].join("\n"));
    const panel: WebviewPanel | undefined = vscode.window.createWebviewPanel(node.name, node.name, vscode.ViewColumn.One, {});
    panel.webview.html = getWebviewContent(head, info, bodyData);
}
