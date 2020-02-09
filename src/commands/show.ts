import * as vscode from "vscode";
import { WebviewPanel } from "vscode";
import { getOneArticleData } from "../api";
import { GcoresNode } from "../explorer/GcoresNode";
import { gcoresTreeDataProvider } from "../explorer/GcoresTreeDataProvider";
import { authorNamesMapping, baseArticleUrl, baseAuthorUrl, baseImgUrl, globalStateGcoresBossKey } from "../shared/shared";
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

function getWebviewContent(head: string, authorRender: string, authorName: string, info: string, content: string, node: GcoresNode): string {
    const isIn: boolean = gcoresTreeDataProvider.isIn;
    const isBookmarked: boolean = node.bookmarkId === "";
    const isLiked: boolean = node.likeId === "";
    const isOldAuthor: boolean = authorNamesMapping.has(authorName);
    let newAuthorIn: boolean = false;
    if (authorName in gcoresTreeDataProvider.newAuthors) {
        newAuthorIn = true;
    }
    const addAuthorButton: { element: string, script: string, style: string } = {
        element: `<button id="addAuthorButton">${!newAuthorIn ? `添加作者` : `取消作者`}</button>`,
        script: `const button = document.getElementById('addAuthorButton');
                button.onclick = () => {vscode.postMessage({
                    command: {
                        action: ${!newAuthorIn ? `'Add Author'` : `'Delete Author'`},
                        data: '${authorRender}',
                    },
                })
                document.getElementById("addAuthorButton").disabled = true;
            };`,
        style: `<style>
            #addAuthorButton {
                display: inline-block;
                margin: 0.2rem;
                padding: 0.2rem 0.2rem;
                border: 0;
                color: white;
                background-color: var(--vscode-button-background);
            }
            #addAuthorButton:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            #addAuthorButton:active {
                border: 0;
            }
            </style>`,
    };
    const addBookmarkButton: { element: string, script: string, style: string } = {
        element: `<button id="addBookmarkButton">${isBookmarked ? `增加书签` : `取消书签`}</button>`,
        script: `const bookmarkButton = document.getElementById('addBookmarkButton');
                bookmarkButton.onclick = () => {vscode.postMessage({
                    command: {
                        action: ${isBookmarked ? `'Add Bookmark'` : `'Delete Bookmark'`},
                        data: {nodeId:'${node.id}', nodeName:'${node.name}', bookmarkId:'${node.bookmarkId}'},
                    },
                })
                document.getElementById("addBookmarkButton").disabled = true;
            };`,
        style: `<style>
            #addBookmarkButton {
                display: inline-block;
                margin: 0.2rem;
                padding: 0.2rem 0.2rem;
                border: 0;
                color: white;
                background-color: var(--vscode-button-background);
            };
            #addBookmarkButton:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            #addBookmarkButton:active {
                border: 0;
            }
            </style>`,
    };
    const addLikeButton: { element: string, script: string, style: string } = {
        element: `<button id="addLikeButton">${isLiked ? `增加点赞` : `取消点赞`}</button>`,
        script: `const likeButton = document.getElementById('addLikeButton');
                likeButton.onclick = () => {vscode.postMessage({
                    command: {
                        action: ${isLiked ? `'Add Like'` : `'Delete Like'`},
                        data: {nodeId:'${node.id}', nodeName:'${node.name}', likeId:'${node.likeId}'},
                    },
                })
                document.getElementById("addLikeButton").disabled = true;
            }
                ;`,
        style: `<style>
            #addLikeButton {
                display: inline-block;
                margin: 0.2rem;
                padding: 0.2rem 0.2rem;
                border: 0;
                color: white;
                background-color: var(--vscode-button-background);
            }
            #addLikeButton:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            #addLikeButton:active {
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
        ${addAuthorButton.style}
        ${addBookmarkButton.style}
        ${addLikeButton.style}
        <style>
            code { white-space: pre-wrap; }
        </style>
    </head>
    <body>
        ${head}
        ${authorRender} ${!isOldAuthor === true ? addAuthorButton.element : ""}
        <hr />
        ${content}
        <hr />
        ${info} ${isIn === true ? addLikeButton.element : ""} ${isIn === true ? addBookmarkButton.element : ""}
    </body>
    <script>
    const vscode = acquireVsCodeApi();
    ${addAuthorButton.script}
    ${addBookmarkButton.script}
    ${addLikeButton.script}
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
        result += detailsFlag === true ? `<details><summary>查看图片</summary>${markdownEngine.render(toRenderText)}</details>` : markdownEngine.render(toRenderText);
    });
    return result;
}

export async function previewArticle(context: vscode.ExtensionContext, node: GcoresNode): Promise<void> {
    const articleData: any = await getOneArticleData(node.id);
    // included[3] or included[2] is the author data, I don't know why!!!
    let authorData: any = articleData.included[2];
    if (authorData.type === "articles") {
        authorData = articleData.included[3];
    }
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
    const authorRender: string = markdownEngine.renderInline(`作者: [${authorName}](${baseAuthorUrl}${authorId})`);
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
    panel.webview.html = getWebviewContent(head, authorRender, authorName, info, bodyData, node);
}
