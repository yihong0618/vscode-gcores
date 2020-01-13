import * as vscode from "vscode";
import { WebviewPanel } from "vscode";
import { getOneArticleData } from "../api";
import { GcoresNode } from "../explorer/GcoresNode";
import { baseArticleUrl, baseImgUrl } from "../shared";
import { markdownEngine } from "../webview/markdownEngine";

const articleStyleMapping: Map<any, any> = new Map([
    ["unstyled", (toRenderText: string): string => `${toRenderText}`],
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
    dataArray.forEach((element: any): void => {
        const textFunc: any = articleStyleMapping.get(element.type);
        let toRenderText: string = "";
        if (element.entityRanges.length !== 0) {
            for (const i of element.entityRanges) {
                const entity: any = entityMap[i.key];
                if (entity.type === "IMAGE") {
                    toRenderText += `![](${baseImgUrl}${entity.data.path})`;
                }
                if (entity.type === "LINK") {
                    const text: string = element.text;
                    const textI: string = text.slice(i["offset"], i["offset"] + i["length"]);
                    toRenderText = text.replace(text, `[${text}](${entity.data.url.trim()})`);
                    // g-cores change to gcores but some link didn't change
                    toRenderText = toRenderText.replace("g-cores", "gcores");
                }
            }
        } else {
            toRenderText = element.text;
        }
        if (textFunc) {
            toRenderText = textFunc(toRenderText);
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
