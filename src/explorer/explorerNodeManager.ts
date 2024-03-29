import { Disposable } from "vscode";
import { getArticlesDataByUserBookmark, getRecentArticlesData, getRecentAudiosData, getRecentNewsData, getRssData } from "../api";
import { articleTagsMapping, baseLimit, Category, defaultArticle, topNamesMapping } from "../shared/shared";
import { GcoresNode } from "./GcoresNode";

// TODO refactor this after v1.0
class ExplorerNodeManager implements Disposable {

    public offsetMapping: Map<string, number> = new Map();
    private explorerNodeMap: Map<string, GcoresNode> = new Map<string, GcoresNode>();
    private limit: number = baseLimit;

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
                id: Category.Top,
                name: Category.Top,
            }), false),
            new GcoresNode(Object.assign({}, defaultArticle, {
                id: Category.Bookmark,
                name: Category.Bookmark,
            }), false),
            new GcoresNode(Object.assign({}, defaultArticle, {
                id: Category.Audios,
                name: Category.Audios,
            }), false),
            new GcoresNode(Object.assign({}, defaultArticle, {
                id: Category.Rss,
                name: Category.Rss,
            }), false),
        ];
    }

    public async GetRecentArticlesNodes(nodeId: string, token?: string| undefined): Promise<GcoresNode[]> {
        const articlesData: any = await getRecentArticlesData(this.limit, this.offsetMapping.get(nodeId) || 0, token);
        const res: GcoresNode[] = [];
        const dataLength: number = articlesData.data.length;
        if (dataLength === 0) {
            return res;
        }
        for (const article of articlesData.data) {
            res.push(await this.parseToGcoresNode(article));
        }
        if (dataLength === baseLimit) {
            res.push(new GcoresNode(Object.assign({}, defaultArticle, {
                id: nodeId,
                name: "更多文章",
            }), false));
            this.offsetMapping.set(nodeId, (this.offsetMapping.get(nodeId) || 0) + baseLimit);
        }
        return res;
    }

    public async GetRecentNewsNodes(nodeId: string, token?: string | undefined): Promise<GcoresNode[]> {
        const articlesData: any = await getRecentNewsData(this.limit, this.offsetMapping.get(nodeId) || 0, token);
        const res: GcoresNode[] = [];
        const dataLength: number = articlesData.data.length;
        if (dataLength === 0) {
            return res;
        }
        for (const article of articlesData.data) {
            res.push(await this.parseToGcoresNode(article));
        }
        if (dataLength === baseLimit) {
            res.push(new GcoresNode(Object.assign({}, defaultArticle, {
                id: nodeId,
                name: "更多新闻",
            }), false));
            this.offsetMapping.set(nodeId, (this.offsetMapping.get(nodeId) || 0) + baseLimit);
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

    public GetTopsNodes(): GcoresNode[] {
        const res: GcoresNode[] = [];
        for (const topName of topNamesMapping.keys()) {
            res.push(new GcoresNode(Object.assign({}, defaultArticle, {
                id: topName,
                name: topName,
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

    public async getOneLabelArticlesNodes(nodeId: string, apiFunc: any, token?: string | undefined): Promise<GcoresNode[]> {
        const articlesData: any = await apiFunc(nodeId, this.limit, this.offsetMapping.get(nodeId) || 0, token);
        const res: GcoresNode[] = [];
        const dataLength: number = articlesData.data.length;
        if (dataLength === 0) {
            return res;
        }
        for (const article of articlesData.data) {
            res.push(await this.parseToGcoresNode(article));
        }
        if (dataLength === baseLimit) {
            res.push(new GcoresNode(Object.assign({}, defaultArticle, {
                id: nodeId,
                name: "更多文章",
            }), false));
            this.offsetMapping.set(nodeId, (this.offsetMapping.get(nodeId) || 0) + baseLimit);
        }
        return res;
    }

    public async getOneLabelRssNodes(url: string): Promise<GcoresNode[]> {
        const rssData: any = await getRssData(url);
        const res: GcoresNode[] = [];
        for (const r of rssData.items) {
            if (r.enclosure && r.enclosure.url) {
                res.push(await this.parseRssToGcoresNode(r));
            }
        }
        // sort by date desc
        res.sort((a: GcoresNode, b: GcoresNode) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return res;
    }

    public async getBookmarkArticlesNodes(nodeId: string, userId: string, token: string): Promise<GcoresNode[]> {
        const bookmarkData: any = await getArticlesDataByUserBookmark(userId, token, this.limit, this.offsetMapping.get(nodeId) || 0);
        const articlesData: any = bookmarkData.included.filter((i: any) => i.type === "articles");
        const res: GcoresNode[] = [];
        const dataLength: number = articlesData.length;
        if (dataLength === 0) {
            return res;
        }
        for (const data of articlesData) {
            res.push(await this.parseToGcoresNode(data));
        }
        if (dataLength === baseLimit) {
            res.push(new GcoresNode(Object.assign({}, defaultArticle, {
                id: nodeId,
                name: "更多文章",
            }), false));
            this.offsetMapping.set(nodeId, (this.offsetMapping.get(nodeId) || 0) + baseLimit);
        }
        return res;
    }

    public async GetRecentAudiosNodes(nodeId: string, token?: string| undefined): Promise<GcoresNode[]> {
        const audiosData: any = await getRecentAudiosData(this.limit, this.offsetMapping.get(nodeId) || 0, token);
        const res: GcoresNode[] = [];
        const dataLength: number = audiosData.data.length;
        if (dataLength === 0) {
            return res;
        }
        for (const audio of audiosData.data) {
            res.push(await this.parseToGcoresNode(audio));
        }
        if (dataLength === baseLimit) {
            res.push(new GcoresNode(Object.assign({}, defaultArticle, {
                id: nodeId,
                name: "更多文章",
            }), false));
            this.offsetMapping.set(nodeId, (this.offsetMapping.get(nodeId) || 0) + baseLimit);
        }
        return res;
    }

    public GetRssNodes(mapping: Map<string, string>): GcoresNode[] {
        // TODO refactor to one function
        const res: GcoresNode[] = [];
        for (const [rssName, rssUrl] of mapping.entries()) {
            res.push(new GcoresNode(Object.assign({}, defaultArticle, {
                id: rssName,
                name: rssName,
                authorId: rssUrl,
            }), false));
        }
        res.push(new GcoresNode(Object.assign({}, defaultArticle, {
            id: "add rss",
            name: "➕ New rss",
        }), false));
        return res;
    }

    public async parseRssToGcoresNode(data: any): Promise<GcoresNode> {
        // maybe use later
        return new GcoresNode({
            id: data.title.trim(),
            name: data.title.trim(),
            type: "radios",
            authorId: "",
            likesCount: 0,
            commentsCount: 0,
            bookmarksCount: 0,
            bookmarkId: "",
            likeId: "",
            createdAt: data.pubDate,
        }, true, "", data.enclosure.url);
    }

    public dispose(): void {
        this.explorerNodeMap.clear();
    }

    public async parseToGcoresNode(data: any): Promise<GcoresNode> {
        const attributes: any = data.attributes;
        // maybe use later
        const linkData: string = "";
        const type: string = data.type;
        return new GcoresNode({
            id: data.id,
            name: attributes.title,
            type,
            authorId: data.relationships.user === {} ? data.relationships.user.data.id : "",
            likesCount: attributes["likes-count"],
            commentsCount: attributes["comments-count"],
            bookmarksCount: attributes["bookmarks-count"],
            bookmarkId: data.meta["bookmark-id"] || "",
            likeId: data.meta["vote-id"] || "",
            createdAt: attributes["published-at"].split("T")[0],
        }, true, linkData);
    }
}

export const explorerNodeManager: ExplorerNodeManager = new ExplorerNodeManager();
