import * as vscode from "vscode";
import { WebviewPanel } from "vscode";
import { getOneArticleData } from "../api";
import { GcoresNode } from "../explorer/GcoresNode";
import { baseArticleUrl, baseAuthorUrl, baseImgUrl, globalStateGcoresBossKey } from "../shared/shared";
import { markdownEngine } from "../webview/markdownEngine";
import { onDidReceiveMessage } from "./utils";

type IRenderText = (text: string) => string;

const articleStyleMapping: Map<string, IRenderText> = new Map([
    ["unstyled", (toRenderText: string): string => `${toRenderText}`],
    ["header-one", (toRenderText: string): string => `# ${toRenderText}`],
    ["header-two", (toRenderText: string): string => `## ${toRenderText}`],
    ["header-three", (toRenderText: string): string => `### ${toRenderText}`],
    ["header-four", (toRenderText: string): string => `#### ${toRenderText}`],
    ["header-five", (toRenderText: string): string => `##### ${toRenderText}`],
    ["unordered-list-item", (toRenderText: string): string => `- ${toRenderText}`],
    // ToDo this is a skip need to refactor
    ["ordered-list-item", (toRenderText: string): string => `${toRenderText}`],
    ["blockquote", (toRenderText: string): string => `> ${toRenderText}`],
]);

function getWebviewContent(head: string, author: string, info: string, content: string): string {
    const button: { element: string, script: string, style: string } = {
        element: `<button id="solve">添加作者</button>`,
        script: `const button = document.getElementById('solve');
                button.onclick = () => vscode.postMessage({
                    command: {
                        action: 'Add Author',
                        data: '${author}',
                    },
                });`,
        style: `<style>
            #solve {
                display: inline-block;
                margin: 0.2rem;
                padding: 0.2rem 0.2rem;
                border: 0;
                color: white;
                background-color: var(--vscode-button-background);
            }
            #solve:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            #solve:active {
                border: 0;
            }
            </style>`,
    };
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https:; script-src vscode-resource: 'unsafe-inline'; style-src vscode-resource: 'unsafe-inline';"/>
        ${markdownEngine.getStyles()}
        ${button.style}
        <style>
            code { white-space: pre-wrap; }
        </style>
    </head>
    <body>
        ${head}
        ${author} ${button.element}
        <hr />
        ${content}
        <hr />
        ${info}
    </body>
    <script>
    const vscode = acquireVsCodeApi();
    ${button.script}
    </script>
    </html>
    `;
}

function parseContent(dataBloks: any | undefined, isBoss: boolean = false): string {
    let result: string = "";
    const dataArray: any = dataBloks.blocks;
    const entityMap: any = dataBloks.entityMap;
    const orderListStack: string[] = [];
    let orderListIndex: number = 1;
    dataArray.forEach((element: any): void => {
        let detailsFlag: boolean = false;
        // TODO order list seems have a better way
        if (orderListStack.pop() === "ordered-list-item") {
            orderListIndex++;
        } else {
            orderListIndex = 1;
        }
        orderListStack.push(element.type);
        let textFunc: IRenderText | undefined = articleStyleMapping.get(element.type);
        if (!textFunc) {
            textFunc = (text: string): string => `${text}`;
        }
        let toRenderText: string = "";
        const isMultiRange: boolean = element.entityRanges.length > 1;
        if (element.entityRanges.length !== 0) {
            for (const i of element.entityRanges) {
                const entity: any = entityMap[i.key];
                if (entity.type === "IMAGE") {
                    toRenderText += `![](${baseImgUrl}${entity.data.path} "${entity.data.caption || ""}")`;
                    detailsFlag = true && isBoss;
                }
                if (entity.type === "LINK") {
                    // handle many links
                    const text: string = isMultiRange ? toRenderText ? toRenderText : element.text : element.text;
                    const textI: string = element.text.slice(i["offset"], i["offset"] + i["length"]);
                    toRenderText = text.replace(textI, `[${textI}](${entity.data.url.trim()})`);
                    // g-cores url change to gcores but some link didn't change
                    toRenderText = toRenderText.replace("g-cores", "gcores");
                }
                if (entity.type === "GALLERY") {
                    const links: any = entity.data.images;
                    for (const link of links) {
                        toRenderText += `![](${baseImgUrl}${link.path})`;
                        detailsFlag = true && isBoss;
                    }
                }
            }
        } else {
            toRenderText = element.text;
            // ordered-list-item
            if (element.type === "ordered-list-item") {
                toRenderText = `${orderListIndex}. ${toRenderText}`;
            }
        }
        toRenderText = textFunc(toRenderText);
        // test if the boss key open.
        result += detailsFlag === true ? `<details>${markdownEngine.render(toRenderText)}</details>` : markdownEngine.render(toRenderText);
    });
    return result;
}

export async function previewArticle(context: vscode.ExtensionContext, node: GcoresNode): Promise<void> {
    const articleData: any = await getOneArticleData(node.id);
    // included[3] is the author data
    const authorData: any = articleData.included[3];
    const articleContent: string = articleData.data.attributes.content;
    const authorId: string = authorData.id;
    const authorName: string = authorData.attributes.nickname;
    const dataBlocks: any | undefined = JSON.parse(articleContent);
    // test if the boss key open

    let isBoss: boolean = false;
    const bosskeyInfo: any = context.globalState.get(globalStateGcoresBossKey);
    if (bosskeyInfo) {
        isBoss = bosskeyInfo.isBoss;
    }
    const bodyData: any = parseContent(dataBlocks, isBoss);
    const head: string = markdownEngine.render(`# [${node.name}](${baseArticleUrl}${node.id})`);
    const author: string = markdownEngine.renderInline(`作者: [${authorName}](${baseAuthorUrl}${authorId})`);
    const info: string = markdownEngine.render([
        `| Likes | Comments | Bookmarks |`,
        `| :---: | :------: | :-------: |`,
        `| ${node.likes} | ${node.comments} | ${node.bookmarks} |`,
    ].join("\n"));
    const panel: WebviewPanel | undefined = vscode.window.createWebviewPanel(node.name, node.name, vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
    });
    panel.webview.onDidReceiveMessage(onDidReceiveMessage);
    panel.webview.html = getWebviewContent(head, author, info, bodyData);
}
