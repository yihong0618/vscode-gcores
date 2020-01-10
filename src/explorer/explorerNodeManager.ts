// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import { Disposable } from "vscode";
import { getArticlesDataByAuthor, getArticlesDataByTag, getRecentArticlesData, getRecentNewsData } from "../api";
import { articleTagsMapping, authorNamesMapping, Category, defaultArticle } from "../shared";
import { GcoresNode } from "./GcoresNode";

class ExplorerNodeManager implements Disposable {
    private explorerNodeMap: Map<string, GcoresNode> = new Map<string, GcoresNode>();

    public async refreshCache(): Promise<void> {
        this.dispose();
    }

    public getRootNodes(): GcoresNode[] {
        return [
            new GcoresNode(Object.assign({}, defaultArticle, {
                id: Category.Recent,
                name: Category.Recent,
            }), false),
            new GcoresNode(Object.assign({}, defaultArticle, {
                id: Category.News,
                name: Category.News,
            }), false),
            new GcoresNode(Object.assign({}, defaultArticle, {
                id: Category.Tag,
                name: Category.Tag,
            }), false),
            new GcoresNode(Object.assign({}, defaultArticle, {
                id: Category.Author,
                name: Category.Author,
            }), false),
        ];
    }

    public async GetRecentArticlesNodes(): Promise<GcoresNode[]> {
        const articlesData: any = await getRecentArticlesData();
        const res: GcoresNode[] = [];
        for (const article of articlesData.data) {
            res.push(this.parseToGcoresNode(article));
        }
        return res;
    }

    public async GetRecentNewsNodes(): Promise<GcoresNode[]> {
        const articlesData: any = await getRecentNewsData();
        const res: GcoresNode[] = [];
        for (const article of articlesData.data) {
            res.push(this.parseToGcoresNode(article));
        }
        return res;
    }

    public GetTagsNodes(): GcoresNode[] {
        const res: GcoresNode[] = [];
        for (const tagName of articleTagsMapping.keys()) {
            res.push(new GcoresNode(Object.assign({}, defaultArticle, {
                id: tagName,
                name: tagName,
            }), false));
        }
        return res;
    }

    public GetAuthorsNodes(): GcoresNode[] {
        const res: GcoresNode[] = [];
        for (const authorName of authorNamesMapping.keys()) {
            res.push(new GcoresNode(Object.assign({}, defaultArticle, {
                id: authorName,
                name: authorName,
            }), false));
        }
        return res;
    }

    public async getOneTagArticlesNodes(nodeId: string): Promise<GcoresNode[]> {
        const articlesData: any = await getArticlesDataByTag(nodeId);
        const res: GcoresNode[] = [];
        for (const article of articlesData.data) {
            res.push(this.parseToGcoresNode(article));
        }
        return res;
    }

    public async getOneAuthorArticlesNodes(nodeId: string): Promise<GcoresNode[]> {
        const articlesData: any = await getArticlesDataByAuthor(nodeId);
        const res: GcoresNode[] = [];
        for (const article of articlesData.data) {
            res.push(this.parseToGcoresNode(article));
        }
        return res;
    }

    public getAllNodes(): GcoresNode[] {
        return Array.from(this.explorerNodeMap.values());
    }

    public getNodeById(id: string): GcoresNode | undefined {
        return this.explorerNodeMap.get(id);
    }

    public dispose(): void {
        this.explorerNodeMap.clear();
    }

    private parseToGcoresNode(data: any): GcoresNode {
        const attributes: any = data.attributes;
        return new GcoresNode({
            id: data.id,
            name: attributes.title,
            author: data.relationships.user.data.id,
            likesCount: attributes["likes-count"],
            commentsCount: attributes["comments-count"],
            bookmarksCount: attributes["bookmarks-count"],
            createdAt: attributes["published-at"].split("T")[0],
        }, true);
    }
}

export const explorerNodeManager: ExplorerNodeManager = new ExplorerNodeManager();
