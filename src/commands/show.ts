import * as vscode from "vscode";
import { getOneArticleData } from "../api"; 

export async function previewArticle(node): Promise<void> {
    console.log(node.id)
    let data = await getOneArticleData(node.id);
    console.log(data)
}