// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import { Disposable } from "vscode";
import { getArticlesDataByUserBookmark, getRecentArticlesData, getRecentNewsData } from "../api";
import { articleTagsMapping, Category, defaultArticle } from "../shared";
import { GcoresNode } from "./GcoresNode";

class ExplorerNodeManager implements Disposable {
    private explorerNodeMap: Map<string, GcoresNode> = new Map<string, GcoresNode>();

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
            new GcoresNode(Object.assign({}, defaultArticle, {
                id: Category.Bookmark,
                name: Category.Bookmark,
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

    public GetAuthorsNodes(mapping: Map<string, string>): GcoresNode[] {
        const res: GcoresNode[] = [];
        for (const [authorName, authorId] of mapping.entries()) {
            res.push(new GcoresNode(Object.assign({}, defaultArticle, {
                id: authorName,
                name: authorName,
                authorId,
            }), false));
        }
        return res;
    }

    public async getOneLabelArticlesNodes(nodeId: string, apiFunc: any): Promise<GcoresNode[]> {
        const articlesData: any = await apiFunc(nodeId);
        const res: GcoresNode[] = [];
        for (const article of articlesData.data) {
            res.push(this.parseToGcoresNode(article));
        }
        return res;
    }

    public async getBookmarkArticlesNodes(userId: string, token: string): Promise<GcoresNode[]> {
        const bookmarkData: any = await getArticlesDataByUserBookmark(userId, token);
        const articlesData: any = bookmarkData.included.filter((i: any) => i.type === "articles");
        const res: GcoresNode[] = [];
        for (const data of articlesData) {
            res.push(this.parseToGcoresNode(data));
        }
        return res;
    }

    public dispose(): void {
        this.explorerNodeMap.clear();
    }

    public parseToGcoresNode(data: any): GcoresNode {
        const attributes: any = data.attributes;
        return new GcoresNode({
            id: data.id,
            name: attributes.title,
            authorId: data.relationships.user === {} ? data.relationships.user.data.id : "",
            likesCount: attributes["likes-count"],
            commentsCount: attributes["comments-count"],
            bookmarksCount: attributes["bookmarks-count"],
            bookmarkId: data.meta["bookmark-id"] || "",
            createdAt: attributes["published-at"].split("T")[0],
        }, true);
    }

}

export const explorerNodeManager: ExplorerNodeManager = new ExplorerNodeManager();
