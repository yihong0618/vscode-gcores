
// add new Category here
export enum Category {
    Recent = "Recent",
    News = "News",
    Tag = "Tag",
    Author = "Author",
}

export interface IArticle {
    id: string;
    name: string;
    author: string;
    likesCount: number;
    commentsCount: number;
    bookmarksCount: number;
    createdAt: string;
}

export const defaultArticle: IArticle = {
    id: "",
    name: "",
    author: "",
    likesCount: 0,
    commentsCount: 0,
    bookmarksCount: 0,
    createdAt: "",
};

// add tag here
export const articleTagsMapping: Map<string, string> = new Map([
    ["有感而发", "56"],
    ["知识挖掘机", "20"],
    ["玩出花儿来", "27"],
    ["人物", "41"],
    ["故事汇", "35"],
]);

// add new author here
export const authorNamesMapping: Map<string, string> = new Map([
    ["西蒙", "3"],
    ["Nadya", "13701"],
    ["Dagou", "91206"],
    ["白广大", "21635"],
    ["Ryoma", "21327"],
]);
